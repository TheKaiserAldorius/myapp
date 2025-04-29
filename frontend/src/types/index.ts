export interface TelegramUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  }
  
  export interface Prize {
    id: number;
    name: string;
    image: string;
    price: number;
  }
  