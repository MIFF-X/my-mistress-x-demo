// auctionService.js - Smart Contract Adapter (Ethers.js)
const { ethers } = require("ethers");

// ABI Snippet for the Auction Contract (Bidding and State)
const AUCTION_ABI = [
  "function placeBid(uint256 auctionId) external payable",
  "function getAuction(uint256 auctionId) external view returns (address seller, uint256 highestBid, address highestBidder, uint256 endTime, bool ended)",
  "function endAuction(uint256 auctionId) external",
  "event BidPlaced(uint256 indexed auctionId, address bidder, uint256 amount)",
  "event AuctionEnded(uint256 auctionId, address winner, uint256 amount)"
];

class AuctionService {
  constructor(providerUrl, contractAddress) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(contractAddress, AUCTION_ABI, this.provider);
  }

  // Get live auction status from chain
  async getAuctionDetails(auctionId) {
    const details = await this.contract.getAuction(auctionId);
    return {
      seller: details.seller,
      highestBid: ethers.utils.formatEther(details.highestBid),
      highestBidder: details.highestBidder,
      endTime: details.endTime.toNumber(),
      ended: details.ended
    };
  }

  // Prepare a transaction for the frontend to sign (React Native Web3)
  async getPlaceBidTx(auctionId, bidAmountEth) {
    const data = this.contract.interface.encodeFunctionData("placeBid", [auctionId]);
    return {
      to: this.contract.address,
      data: data,
      value: ethers.utils.parseEther(bidAmountEth.toString()).toHexString()
    };
  }
}

module.exports = AuctionService;
