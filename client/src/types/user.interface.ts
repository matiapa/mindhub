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
      sharedInterests?: {
        resource: {
          id: string;
          name: string;
          pictureUrl: string;
          type: string;
        }[];
      };
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
      friendship: number;
      interests: number;
    };
  }
  