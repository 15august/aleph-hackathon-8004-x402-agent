const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Registering with:", deployer.address);

  const registryAddress = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
  
  // Try simple register(string) first
  const abi = [
    "function register(string calldata agentURI) external returns (uint256)",
    "function register(string calldata agentURI, tuple(string key, bytes value)[] calldata metadata) external returns (uint256)",
    "function register() external returns (uint256)"
  ];
  
  const registry = new hre.ethers.Contract(registryAddress, abi, deployer);

  try {
    console.log("Trying register(agentURI)...");
    const tx = await registry["register(string)"]("https://casa402.example.com/agent.json");
    const receipt = await tx.wait();
    console.log("Success! TX:", receipt.hash);
    
    // Find the agentId from events
    for (const log of receipt.logs) {
      console.log("Log:", log);
    }
  } catch (e) {
    console.log("register(string) failed:", e.message);
    
    try {
      console.log("\nTrying register()...");
      const tx = await registry["register()"]();
      const receipt = await tx.wait();
      console.log("Success! TX:", receipt.hash);
    } catch (e2) {
      console.log("register() failed:", e2.message);
    }
  }
}

main().then(() => process.exit(0)).catch(console.error);