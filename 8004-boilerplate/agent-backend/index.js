/**
 * ERC-8004 Agent Backend Service
 *
 * This service:
 * 1. Polls the TaskAgent contract for pending tasks
 * 2. Processes tasks using handlers (your AI logic)
 * 3. Submits results back on-chain
 *
 * Usage: npm start
 */

require("dotenv").config({ path: "../.env" });
const { ethers } = require("ethers");
const { processTask } = require("./handlers");

// Load deployment info
let deploymentInfo;
try {
  deploymentInfo = require("../deployment-fuji.json");
} catch (e) {
  console.error("Error: deployment-fuji.json not found. Run deployment first.");
  process.exit(1);
}

// Contract ABI (minimal for task operations)
const TaskAgentABI = [
  "function getTotalTasks() view returns (uint256)",
  "function getAllTaskIds() view returns (uint256[])",
  "function getTask(uint256 taskId) view returns (tuple(uint256 taskId, uint256 agentId, address requester, uint8 taskType, uint8 status, string inputURI, bytes32 inputHash, string outputURI, bytes32 outputHash, uint256 payment, uint256 createdAt, uint256 completedAt))",
  "function startTask(uint256 taskId)",
  "function completeTask(uint256 taskId, string outputURI, bytes32 outputHash)",
  "event TaskRequested(uint256 indexed taskId, address indexed requester, uint8 taskType, uint256 payment)",
];

const TASK_STATUS = ["Pending", "InProgress", "Completed", "Disputed", "Cancelled"];
const TASK_TYPES = ["Summarization", "CodeReview", "DataAnalysis", "Translation", "Custom"];

// Configuration
const CONFIG = {
  rpc: process.env.RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
  privateKey: process.env.PRIVATE_KEY,
  taskAgentAddress: deploymentInfo.contracts.taskAgent,
  pollInterval: parseInt(process.env.POLL_INTERVAL) || 10000,
};

class AgentBackend {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.rpc);
    this.wallet = new ethers.Wallet(CONFIG.privateKey, this.provider);
    this.taskAgent = new ethers.Contract(CONFIG.taskAgentAddress, TaskAgentABI, this.wallet);
    this.processedTasks = new Set();
  }

  async start() {
    console.log("========================================");
    console.log("  ERC-8004 Agent Backend Started");
    console.log("========================================");
    console.log(`Contract: ${CONFIG.taskAgentAddress}`);
    console.log(`Operator: ${this.wallet.address}`);
    console.log(`Poll Interval: ${CONFIG.pollInterval}ms`);
    console.log("========================================\n");

    // Initial check
    await this.checkAndProcessTasks();

    // Start polling
    setInterval(() => this.checkAndProcessTasks(), CONFIG.pollInterval);

    // Also listen for new task events
    this.taskAgent.on("TaskRequested", (taskId, requester, taskType, payment) => {
      console.log(`\n[Event] New task #${taskId} from ${requester}`);
      this.checkAndProcessTasks();
    });
  }

  async checkAndProcessTasks() {
    try {
      const taskIds = await this.taskAgent.getAllTaskIds();

      for (const taskId of taskIds) {
        const id = taskId.toString();

        // Skip already processed
        if (this.processedTasks.has(id)) continue;

        const task = await this.taskAgent.getTask(taskId);

        // Only process pending tasks (status 0)
        if (task.status === 0n) {
          await this.processTaskOnChain(task);
        } else if (task.status === 2n) {
          // Already completed, mark as processed
          this.processedTasks.add(id);
        }
      }
    } catch (error) {
      console.error("[Error] Failed to check tasks:", error.message);
    }
  }

  async processTaskOnChain(task) {
    const taskId = task.taskId.toString();
    console.log(`\n[Task #${taskId}] Processing...`);
    console.log(`  Type: ${TASK_TYPES[Number(task.taskType)]}`);
    console.log(`  Requester: ${task.requester}`);

    try {
      // 1. Start the task
      console.log("  [1/3] Starting task on-chain...");
      const startTx = await this.taskAgent.startTask(taskId);
      await startTx.wait();

      // 2. Extract input and process
      console.log("  [2/3] Processing with AI handler...");
      const input = this.decodeInput(task.inputURI);
      const result = await processTask(Number(task.taskType), input);

      // 3. Complete the task
      console.log("  [3/3] Completing task on-chain...");
      const outputHash = ethers.keccak256(ethers.toUtf8Bytes(result.output));
      const completeTx = await this.taskAgent.completeTask(taskId, result.outputURI, outputHash);
      await completeTx.wait();

      this.processedTasks.add(taskId);
      console.log(`  [Done] Task #${taskId} completed successfully!`);

    } catch (error) {
      console.error(`  [Error] Failed to process task #${taskId}:`, error.message);
    }
  }

  decodeInput(inputURI) {
    // Handle data URI
    if (inputURI.startsWith("data:")) {
      const match = inputURI.match(/data:[^,]*,(.+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    // Handle IPFS (you'd need to fetch from gateway)
    if (inputURI.startsWith("ipfs://")) {
      // TODO: Implement IPFS fetching
      return inputURI;
    }
    return inputURI;
  }
}

// Start the agent
const agent = new AgentBackend();
agent.start().catch(console.error);
