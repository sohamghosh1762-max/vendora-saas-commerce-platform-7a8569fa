import avatarAditi from "@/assets/avatar-aditi.jpg";
import avatarRohan from "@/assets/avatar-rohan.jpg";
import avatarNehak from "@/assets/avatar-nehak.jpg";

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  verified: boolean;
  avatar?: string;
  location?: string;
  role?: string;
  date?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Aditi Sharma",
    text: "Amazing products and super fast delivery! Love supporting independent stores on Vendora. The quality is always top-notch.",
    rating: 5,
    verified: true,
    avatar: avatarAditi,
    location: "Mumbai",
    date: "2 days ago",
  },
  {
    id: "testimonial-2",
    name: "Rohan Mehta",
    text: "Great variety of products and smooth shopping experience. The platform is clean and easy to use.",
    rating: 5,
    verified: true,
    avatar: avatarRohan,
    location: "Bengaluru",
    date: "1 week ago",
  },
  {
    id: "testimonial-3",
    name: "Neha Kapoor",
    text: "Finally a place where I can find unique products from small businesses. Highly recommended!",
    rating: 5,
    verified: true,
    avatar: avatarNehak,
    location: "New Delhi",
    date: "2 weeks ago",
  },
  {
    id: "testimonial-4",
    name: "Vikram Singhania",
    text: "The quality of the ceramic mugs and artisan home decor I received was outstanding. Easy returns policy gave me total peace of mind.",
    rating: 5,
    verified: true,
    location: "Pune",
    date: "3 weeks ago",
  },
  {
    id: "testimonial-5",
    name: "Priya Patel",
    text: "Finding curated fashion pieces that aren't mass-produced was so difficult before Vendora. Checkout was seamless and dispatch was same-day.",
    rating: 5,
    verified: true,
    location: "Ahmedabad",
    date: "1 month ago",
  },
  {
    id: "testimonial-6",
    name: "Ananya Iyer",
    text: "The vendor storefronts each feel distinct and personal. I discovered a botanical skincare brand that I now re-order every single month.",
    rating: 5,
    verified: true,
    location: "Chennai",
    date: "1 month ago",
  },
];

/** Fetch testimonials, supporting future API integration */
export async function getTestimonials(): Promise<Testimonial[]> {
  // Can be hooked to backend API when available
  return [...testimonials];
}
