export interface RiderBid {
  id: string;
  orderId: string;
  riderId: string;
  riderName?: string;
  bidPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
}

const bids: RiderBid[] = [];

export class BidRepository {
  async create(data: any): Promise<RiderBid> {
    const bid: RiderBid = {
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      status: 'PENDING',
      ...data
    };

    bids.push(bid);
    return bid;
  }

  async findByOrderId(orderId: string): Promise<RiderBid[]> {
    return bids.filter(b => b.orderId === orderId);
  }

  async updateStatus(id: string, status: RiderBid['status']) {
    const bid = bids.find(b => b.id === id);
    if (!bid) throw new Error('Bid not found');

    bid.status = status;
    return bid;
  }

  async rejectOthers(orderId: string, selectedBidId: string) {
    bids.forEach(b => {
      if (b.orderId === orderId && b.id !== selectedBidId) {
        b.status = 'REJECTED';
      }
    });
  }

  async findById(id: string) {
    return bids.find(b => b.id === id) || null;
  }
}

export const bidRepository = new BidRepository();