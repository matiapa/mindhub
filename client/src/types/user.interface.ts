interface SharedInterest {
  resource: {
    id: string;
    name: string;
    type: string;
  }
}

export default interface User {
    user: {
      _id: string;
      profile: {
        name: string;
        age: number;
        gender: string;
        biography?: string;
      };
      inactiveHours: number;
      distance?: number;
      sharedInterests?: SharedInterest[];
      personality?: {
        o: number;
        c: number;
        e: number;
        a: number;
        n: number;
      };
      rating?: number;
    };
    score: {
      global: number;
      friendship: {
        score: number;
      };
      interests: {
        score: number;
      };
    };
  }
