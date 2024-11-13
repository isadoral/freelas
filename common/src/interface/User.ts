interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  address?: Address;
  roles: string[];
  createdAt: Date;
}
