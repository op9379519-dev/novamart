import React, { useState } from "react";
import { OrderItem, Coupon, Address, User } from "../types";
import { Trash2, ShoppingBag, PlusCircle, MinusCircle, FileText, Gift, CreditCard, Sparkles, Lock, ChevronDown, Truck } from "lucide-react";

const INDIAN_STATES_CITIES: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair", "Garacharma", "Bambooflat"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Kakinada", "Rajahmundry", "Anantapur", "Kadapa", "Eluru", "Vizianagaram"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Tezu", "Bomdila"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai", "Katihar", "Munger", "Saharsa"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Dhamtari"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Vasant Kunj", "Connaught Place", "Okhla", "Laxmi Nagar", "Rajouri Garden"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand", "Navsari", "Morbi", "Nadiad", "Bharuch"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Kurukshetra"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan", "Una", "Kullu", "Hamirpur"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Sopore"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Tumakuru", "Shivamogga", "Kalaburagi", "Udupi", "Bidar", "Hassan"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Manjeri", "Thalassery"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Amini"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Chhindwara"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Amravati", "Nanded", "Kolhapur", "Sangli", "Jalgaon", "Akola", "Latur"],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Churachandpur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Saiha"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang", "Wokha"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Sri Ganganagar", "Pali", "Chittorgarh"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Nagercoil", "Thanjavur", "Dindigul", "Kancheepuram", "Cuddalore"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Noida", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Muzaffarnagar", "Mathura", "Ayodhya", "Firozabad", "Lakhimpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Halduani-cum-Kathgodam", "Roorkee", "Rudrapur", "Kashipur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Maheshtala", "Rajpur Sonarpur", "Gopalpur", "Bhatpara", "Kharagpur", "Bardhaman", "Baharampur"]
};

const CITY_PIN_PREFIXES: Record<string, string[]> = {
  // Andaman and Nicobar Islands
  "Port Blair": ["744"], "Garacharma": ["744"], "Bambooflat": ["744"],
  // Andhra Pradesh
  "Visakhapatnam": ["530", "531"], "Vijayawada": ["520", "521"], "Guntur": ["522"], "Nellore": ["524"], "Tirupati": ["517"], "Kurnool": ["518"], "Kakinada": ["533"], "Rajahmundry": ["533"], "Anantapur": ["515"], "Kadapa": ["516"], "Eluru": ["534"], "Vizianagaram": ["535"],
  // Arunachal Pradesh
  "Itanagar": ["791"], "Naharlagun": ["791"], "Pasighat": ["791"], "Tawang": ["790"], "Ziro": ["791"], "Tezu": ["792"], "Bomdila": ["790"],
  // Assam
  "Guwahati": ["781"], "Silchar": ["788"], "Dibrugarh": ["786"], "Jorhat": ["785"], "Nagaon": ["782"], "Tinsukia": ["786"], "Tezpur": ["784"], "Bongaigaon": ["783"], "Karimganj": ["788"], "Sivasagar": ["785"],
  // Bihar
  "Patna": ["800"], "Gaya": ["823"], "Bhagalpur": ["812"], "Muzaffarpur": ["842"], "Purnia": ["854"], "Darbhanga": ["846"], "Ara": ["802"], "Begusarai": ["851"], "Katihar": ["854"], "Munger": ["811"], "Saharsa": ["852"],
  // Chandigarh
  "Chandigarh": ["160"],
  // Chhattisgarh
  "Raipur": ["492", "493"], "Bhilai": ["490", "491"], "Bilaspur": ["495"], "Korba": ["495"], "Rajnandgaon": ["491"], "Jagdalpur": ["494"], "Raigarh": ["496"], "Ambikapur": ["497"], "Dhamtari": ["493"],
  // Dadra and Nagar Haveli and Daman and Diu
  "Daman": ["396"], "Diu": ["362"], "Silvassa": ["396"],
  // Delhi
  "New Delhi": ["110"], "Dwarka": ["110"], "Rohini": ["110"], "Saket": ["110"], "Karol Bagh": ["110"], "Vasant Kunj": ["110"], "Connaught Place": ["110"], "Okhla": ["110"], "Laxmi Nagar": ["110"], "Rajouri Garden": ["110"],
  // Goa
  "Panaji": ["403"], "Margao": ["403"], "Vasco da Gama": ["403"], "Mapusa": ["403"], "Ponda": ["403"],
  // Gujarat
  "Ahmedabad": ["380", "382"], "Surat": ["395", "394"], "Vadodara": ["390", "391"], "Rajkot": ["360"], "Bhavnagar": ["364"], "Jamnagar": ["361"], "Gandhinagar": ["382"], "Junagadh": ["362"], "Gandhidham": ["370"], "Anand": ["388"], "Navsari": ["396"], "Morbi": ["363"], "Nadiad": ["387"], "Bharuch": ["392"],
  // Haryana
  "Gurugram": ["122"], "Faridabad": ["121"], "Panipat": ["132"], "Ambala": ["133", "134"], "Yamunanagar": ["135"], "Rohtak": ["124"], "Hisar": ["125"], "Karnal": ["132"], "Sonipat": ["131"], "Panchkula": ["134"], "Kurukshetra": ["136"],
  // Himachal Pradesh
  "Shimla": ["171"], "Dharamshala": ["176"], "Solan": ["173"], "Mandi": ["175"], "Nahan": ["173"], "Una": ["174"], "Kullu": ["175"], "Hamirpur": ["177"],
  // Jammu and Kashmir
  "Srinagar": ["190"], "Jammu": ["180"], "Anantnag": ["192"], "Baramulla": ["193"], "Kathua": ["184"], "Udhampur": ["182"], "Sopore": ["193"],
  // Jharkhand
  "Ranchi": ["834"], "Jamshedpur": ["831", "832"], "Dhanbad": ["826", "828"], "Bokaro Steel City": ["827"], "Deoghar": ["814"], "Phusro": ["829"], "Hazaribagh": ["825"], "Giridih": ["815"], "Ramgarh": ["829"],
  // Karnataka
  "Bengaluru": ["560"], "Mysuru": ["570"], "Hubballi-Dharwad": ["580"], "Mangaluru": ["575"], "Belagavi": ["590"], "Davangere": ["577"], "Ballari": ["583"], "Tumakuru": ["572"], "Shivamogga": ["577"], "Kalaburagi": ["585"], "Udupi": ["576"], "Bidar": ["585"], "Hassan": ["573"],
  // Kerala
  "Thiruvananthapuram": ["695"], "Kochi": ["682", "683"], "Kozhikode": ["673"], "Thrissur": ["680"], "Kollam": ["691"], "Alappuzha": ["688"], "Palakkad": ["678"], "Kannur": ["670"], "Kottayam": ["686"], "Manjeri": ["676"], "Thalassery": ["670"],
  // Ladakh
  "Leh": ["194"], "Kargil": ["194"],
  // Lakshadweep
  "Kavaratti": ["682"], "Agatti": ["682"], "Amini": ["682"],
  // Madhya Pradesh
  "Indore": ["452", "453"], "Bhopal": ["462"], "Jabalpur": ["482"], "Gwalior": ["474"], "Ujjain": ["456"], "Sagar": ["470"], "Dewas": ["455"], "Satna": ["485"], "Ratlam": ["457"], "Rewa": ["486"], "Katni": ["483"], "Singrauli": ["486"], "Chhindwara": ["480"],
  // Maharashtra
  "Mumbai": ["400"], "Pune": ["411", "412"], "Nagpur": ["440", "441"], "Thane": ["400", "421", "401"], "Pimpri-Chinchwad": ["411", "412"], "Nashik": ["422"], "Kalyan-Dombivli": ["421"], "Vasai-Virar": ["401"], "Aurangabad": ["431"], "Navi Mumbai": ["400", "410"], "Solapur": ["413"], "Mira-Bhayandar": ["401"], "Amravati": ["444"], "Nanded": ["431"], "Kolhapur": ["416"], "Sangli": ["416"], "Jalgaon": ["425"], "Akola": ["444"], "Latur": ["413"],
  // Manipur
  "Imphal": ["795"], "Thoubal": ["795"], "Kakching": ["795"], "Churachandpur": ["795"],
  // Meghalaya
  "Shillong": ["793"], "Tura": ["794"], "Jowai": ["793"], "Nongpoh": ["793"],
  // Mizoram
  "Aizawl": ["796"], "Lunglei": ["796"], "Champhai": ["796"], "Saiha": ["796"],
  // Nagaland
  "Dimapur": ["797"], "Kohima": ["797"], "Mokokchung": ["798"], "Tuensang": ["798"], "Wokha": ["797"],
  // Odisha
  "Bhubaneswar": ["751"], "Cuttack": ["753"], "Rourkela": ["769"], "Berhampur": ["760"], "Sambalpur": ["768"], "Puri": ["752"], "Balasore": ["756"], "Bhadrak": ["756"], "Baripada": ["757"], "Jharsuguda": ["768"],
  // Puducherry
  "Puducherry": ["605"], "Karaikal": ["609"], "Mahe": ["673"], "Yanam": ["533"],
  // Punjab
  "Ludhiana": ["141"], "Amritsar": ["143"], "Jalandhar": ["144"], "Patiala": ["147"], "Bathinda": ["151"], "Mohali": ["140", "160"], "Hoshiarpur": ["146"], "Pathankot": ["145"], "Moga": ["142"], "Abohar": ["152"],
  // Rajasthan
  "Jaipur": ["302"], "Jodhpur": ["342"], "Kota": ["324"], "Bikaner": ["334"], "Ajmer": ["305"], "Udaipur": ["313", "799"], "Bhilwara": ["311"], "Alwar": ["301"], "Sikar": ["332"], "Bharatpur": ["321"], "Sri Ganganagar": ["335"], "Pali": ["306"], "Chittorgarh": ["312"],
  // Sikkim
  "Gangtok": ["737"], "Namchi": ["737"], "Gyalshing": ["737"], "Mangan": ["737"],
  // Tamil Nadu
  "Chennai": ["600"], "Coimbatore": ["641"], "Madurai": ["625"], "Tiruchirappalli": ["620"], "Salem": ["636"], "Tiruppur": ["641", "638"], "Erode": ["638"], "Vellore": ["632"], "Thoothukudi": ["628"], "Nagercoil": ["629"], "Thanjavur": ["613"], "Dindigul": ["624"], "Kancheepuram": ["631", "603"], "Cuddalore": ["607"],
  // Telangana
  "Hyderabad": ["500"], "Warangal": ["506"], "Nizamabad": ["503"], "Karimnagar": ["505"], "Ramagundam": ["505"], "Khammam": ["507"], "Mahbubnagar": ["509"], "Nalgonda": ["508"], "Adilabad": ["504"],
  // Tripura
  "Agartala": ["799"], "Dharmanagar": ["799"], "Kailasahar": ["799"],
  // Uttar Pradesh
  "Lucknow": ["226"], "Kanpur": ["208"], "Ghaziabad": ["201"], "Agra": ["282"], "Meerut": ["250"], "Varanasi": ["221"], "Noida": ["201"], "Prayagraj": ["211"], "Bareilly": ["243"], "Aligarh": ["202"], "Moradabad": ["244"], "Saharanpur": ["247"], "Gorakhpur": ["273"], "Jhansi": ["284"], "Muzaffarnagar": ["251"], "Mathura": ["281"], "Ayodhya": ["224"], "Firozabad": ["283"], "Lakhimpur": ["262"],
  // Uttarakhand
  "Dehradun": ["248"], "Haridwar": ["249"], "Halduani-cum-Kathgodam": ["263"], "Roorkee": ["247"], "Rudrapur": ["263"], "Kashipur": ["244"], "Rishikesh": ["249"],
  // West Bengal
  "Kolkata": ["700"], "Howrah": ["711"], "Darjeeling": ["734"], "Siliguri": ["734"], "Asansol": ["713"], "Durgapur": ["713"], "Maheshtala": ["700"], "Rajpur Sonarpur": ["700"], "Gopalpur": ["700"], "Bhatpara": ["743"], "Kharagpur": ["721"], "Bardhaman": ["713"], "Baharampur": ["742"]
};

const getDeliveryDateString = (pincode: string, isPriority: boolean): string => {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return "";
  }
  const firstDigit = pincode[0];
  let days = 3;
  if (firstDigit === "5" || firstDigit === "6") {
    days = 2; // South India
  } else if (firstDigit === "3" || firstDigit === "4") {
    days = 3; // West/Central India
  } else if (firstDigit === "1" || firstDigit === "2") {
    days = 4; // North India
  } else if (firstDigit === "7" || firstDigit === "8") {
    days = 5; // East/North-East India
  }

  if (isPriority) {
    days = Math.max(1, days - 1);
  }

  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
};

interface CartCheckoutProps {
  cartItems: OrderItem[];
  coupons: Coupon[];
  currentUser: User | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutComplete: (orderData: {
    items: OrderItem[];
    subtotal: number;
    gst: number;
    discount: number;
    total: number;
    shippingAddress: Address;
    paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'wallet';
  }) => void;
  onApplyGiftCard: (amount: number) => void;
  onOpenLoginModal: () => void;
}

export default function CartCheckout({
  cartItems,
  coupons,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutComplete,
  onApplyGiftCard,
  onOpenLoginModal
}: CartCheckoutProps) {
  const [couponCode, setCouponCode] = useState<string>("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [giftCardClaim, setGiftCardClaim] = useState<string>("");
  const [giftCardStatus, setGiftCardStatus] = useState<string>("");

  const [shippingMethod, setShippingMethod] = useState<"standard" | "priority">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay" | "wallet" | "cod">("cod");

  // Unauthenticated login cover guard
  if (!currentUser) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6" id="unauthenticated-cart-view">
        <div className="inline-flex p-5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 animate-pulse">
          <ShoppingBag size={44} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">Secure Google Account Required</h2>
          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
            Under NovaMart regulations, custom-crafted multi-vendor shopping, orders, and payment integrations mandate a verified Google authentication link.
          </p>
        </div>
        <button
          onClick={onOpenLoginModal}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <span>Authorize Sign-In with Google</span>
        </button>
      </div>
    );
  }

  // Address entry state - Mandatory and fresh on every order check
  const [checkoutName, setCheckoutName] = useState<string>(currentUser.name || "");
  const [checkoutPhone, setCheckoutPhone] = useState<string>("");
  const [checkoutEmail, setCheckoutEmail] = useState<string>(currentUser.email || "");
  const [checkoutHouseNo, setCheckoutHouseNo] = useState<string>("");
  const [checkoutBuilding, setCheckoutBuilding] = useState<string>("");
  const [checkoutStreet, setCheckoutStreet] = useState<string>("");
  const [checkoutLandmark, setCheckoutLandmark] = useState<string>("");
  const [checkoutCity, setCheckoutCity] = useState<string>("");
  const [checkoutState, setCheckoutState] = useState<string>("");
  const [checkoutZip, setCheckoutZip] = useState<string>("");
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);

  const [aiError, setAiError] = useState<string>("");
  const [aiSuccess, setAiSuccess] = useState<string>("");

  // Real-time verification of physical Indian postal address registry matching
  const validateIndianAddress = (pincode: string, stateName: string, cityName: string) => {
    const pin = pincode.trim().replace(/\s/g, "");
    if (!pin) return { isValid: false, message: "" };
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return {
        isValid: false,
        message: "🇮🇳 Indian postal PIN code must be exactly 6 digits."
      };
    }

    const firstDigit = pin[0];
    const firstTwo = pin.substring(0, 2);
    const st = stateName.trim().toLowerCase();

    // Mapping state name checks
    if ((st.includes("delhi") || st.includes("dl")) && firstTwo !== "11") {
      return { isValid: false, message: "❌ Verification failed: Delhi pincodes must start with 11." };
    }
    if ((st.includes("uttar pradesh") || st.includes("up") || st.includes("uttarakhand") || st.includes("uk")) && firstDigit !== "2") {
      return { isValid: false, message: "❌ Verification failed: Uttar Pradesh / Uttarakhand pincodes must start with 2." };
    }
    if ((st.includes("rajasthan") || st.includes("rj") || st.includes("gujarat") || st.includes("gj")) && firstDigit !== "3") {
      return { isValid: false, message: "❌ Verification failed: Rajasthan / Gujarat pincodes must start with 3." };
    }
    if ((st.includes("maharashtra") || st.includes("mh") || st.includes("madhya pradesh") || st.includes("mp") || st.includes("chhattisgarh") || st.includes("goa")) && firstDigit !== "4") {
      return { isValid: false, message: "❌ Verification failed: Maharashtra, MP & Chhattisgarh pincodes must start with 4." };
    }
    if ((st.includes("andhra") || st.includes("telangana") || st.includes("karnataka") || st.includes("ka") || st.includes("ap") || st.includes("ts")) && firstDigit !== "5") {
      return { isValid: false, message: "❌ Verification failed: Karnataka, Andhra, & Telangana pincodes must start with 5." };
    }
    if ((st.includes("tamil nadu") || st.includes("tn") || st.includes("kerala") || st.includes("kl") || st.includes("pondicherry")) && firstDigit !== "6") {
      return { isValid: false, message: "❌ Verification failed: Tamil Nadu & Kerala pincodes must start with 6." };
    }
    if ((st.includes("west bengal") || st.includes("wb") || st.includes("odisha") || st.includes("orissa") || st.includes("sikkim") || st.includes("assam")) && firstDigit !== "7") {
      return { isValid: false, message: "❌ Verification failed: West Bengal, Odisha, Sikkim & Assam pincodes must start with 7." };
    }
    if ((st.includes("bihar") || st.includes("br") || st.includes("jharkhand") || st.includes("jh")) && firstDigit !== "8") {
      return { isValid: false, message: "❌ Verification failed: Bihar & Jharkhand pincodes must start with 8." };
    }

    if (cityName.trim().length < 3) {
      return { isValid: false, message: "❌ Invalid Address entry: City name is required." };
    }
    if (stateName.trim().length < 2) {
      return { isValid: false, message: "❌ Invalid Address entry: State name is required." };
    }

    // City-specific Pincode Prefix checking
    const cityClean = cityName.trim();
    const cityPrefixes = CITY_PIN_PREFIXES[cityClean];
    if (cityPrefixes && cityPrefixes.length > 0) {
      const match = cityPrefixes.some((pref) => pin.startsWith(pref));
      if (!match) {
        return {
          isValid: false,
          message: `❌ Verification failed: PIN code ${pin} does not belong to ${cityClean}. PIN codes for ${cityClean} typically start with ${cityPrefixes.join(", ")}.`
        };
      }
    }

    return {
      isValid: true,
      message: `Verified real pincode for ${cityName}, ${stateName} ✅`
    };
  };

  React.useEffect(() => {
    if (checkoutZip && checkoutZip.length === 6) {
      const res = validateIndianAddress(checkoutZip, checkoutState, checkoutCity);
      if (res.isValid) {
        setAiSuccess(res.message);
        setAiError("");
      } else {
        setAiError(res.message);
        setAiSuccess("");
      }
    } else {
      setAiError("");
      setAiSuccess("");
    }
  }, [checkoutZip, checkoutState, checkoutCity]);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const shippingCost = shippingMethod === "priority" ? 150.00 : (subtotal >= 500 ? 0.00 : 78.00);
  const platformFee = 21.00;  // Minimum Fixed Platform processing parameter (₹21)
  const codFee = 25.00;      // Minimum Cash On Delivery processing fee (₹25)

  let discount = 0;
  if (activeCoupon) {
    if (subtotal >= activeCoupon.minOrderValue) {
      if (activeCoupon.type === "fixed") {
        discount = activeCoupon.discountValue;
      } else {
        discount = (subtotal * activeCoupon.discountValue) / 100;
      }
    }
  }

  // 18% inclusive GST modeling (already included in product listing)
  const gstRate = 0.18;
  const netTaxable = (subtotal - discount) / (1 + gstRate);
  const gst = parseFloat(((subtotal - discount) - netTaxable).toFixed(2));
  const total = parseFloat((subtotal - discount + shippingCost + platformFee + codFee).toFixed(2));

  // Handle Coupon Apply
  const applyCoupon = () => {
    setCouponError("");
    const matched = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!matched) {
      setCouponError("Invalid promo code. Try NOVAMART1000 or FESTIVE20!");
      setActiveCoupon(null);
      return;
    }
    if (subtotal < matched.minOrderValue) {
      setCouponError(`Minimum purchase for ${matched.code} is ₹${matched.minOrderValue.toLocaleString("en-IN")}`);
      setActiveCoupon(null);
      return;
    }
    setActiveCoupon(matched);
  };

  // Claim Gift Card (simulated credit)
  const claimGiftCardCode = () => {
    setGiftCardStatus("");
    if (giftCardClaim.trim().toUpperCase() === "GIFT1000") {
      onApplyGiftCard(1000);
      setGiftCardStatus("Success: ₹1000 Gift Card added to your wallet! Try checkout via internal wallet payment.");
      setGiftCardClaim("");
    } else if (giftCardClaim.trim().toUpperCase() === "LOYALTY200") {
      onApplyGiftCard(200);
      setGiftCardStatus("Success: ₹200 Loyalty points added to your account wallet.");
      setGiftCardClaim("");
    } else {
      setGiftCardStatus("Invalid code. Try using 'GIFT1000' or 'LOYALTY200'!");
    }
  };

  const executeCheckout = () => {
    if (cartItems.length === 0) return;

    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutEmail.trim() || 
        !checkoutHouseNo.trim() || !checkoutBuilding.trim() || !checkoutStreet.trim() || 
        !checkoutLandmark.trim() || !checkoutCity.trim() || !checkoutState.trim() || !checkoutZip.trim()) {
      setAiError("All shipping address details (including house no, building, landmark, phone, email, pincode) are strictly mandatory.");
      setAiSuccess("");
      // Scroll to address panel if needed
      const elem = document.getElementById("address-mandated-section");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const verification = validateIndianAddress(checkoutZip, checkoutState, checkoutCity);
    if (!verification.isValid) {
      setAiError(verification.message || "Address inputs do not match real Indian postal parameters.");
      setAiSuccess("");
      const elem = document.getElementById("address-mandated-section");
      if (elem) elem.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const finalAddress: Address = {
      id: `addr-${Date.now()}`,
      name: checkoutName.trim(),
      phone: checkoutPhone.trim(),
      email: checkoutEmail.trim(),
      houseNo: checkoutHouseNo.trim(),
      building: checkoutBuilding.trim(),
      street: checkoutStreet.trim(),
      city: checkoutCity.trim(),
      state: checkoutState.trim(),
      zipCode: checkoutZip.trim(),
      pincode: checkoutZip.trim(),
      details: `${checkoutHouseNo.trim()}, ${checkoutBuilding.trim()}, ${checkoutStreet.trim()}, Landmark: ${checkoutLandmark.trim()}`,
      landmark: checkoutLandmark.trim(),
      isDefault: true
    };

    onCheckoutComplete({
      items: cartItems,
      subtotal,
      gst,
      discount,
      total,
      shippingAddress: finalAddress,
      paymentMethod
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4" id="empty-cart-view">
        <div className="inline-flex p-4 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-black text-neutral-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          Browse through our enterprise catalogs, choose custom configurations, and add modern smart items to build your cart.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left pb-16" id="cart-container">
      
      {/* Items List (Left Side) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-black text-neutral-950 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded"></span> Shopping Bag ({cartItems.length} styles)
          </h2>
          <button onClick={onClearCart} className="text-xs text-red-500 font-bold hover:underline">
            Empty Entire Bag
          </button>
        </div>

        {/* Cart Item Row Cards */}
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {cartItems.map((item) => (
            <div key={item.productId} className="py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              
              {/* Image & Detail */}
              <div className="flex items-center gap-4 min-w-0">
                <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0" />
                <div className="min-w-0 text-left">
                  <h3 className="text-sm font-bold text-neutral-950 dark:text-white truncate">{item.productName}</h3>
                  <div className="flex flex-wrap gap-2.5 mt-1.5">
                    {Object.entries(item.variantSelections).map(([key, val]) => (
                      <span key={key} className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold px-2 py-0.5 rounded">
                        {key}: <span className="text-neutral-900 dark:text-white">{val}</span>
                      </span>
                    ))}
                    <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                      Seller Ref: #{item.sellerId.substring(0, 5)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                {/* Quantity Toggler */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                  >
                    <MinusCircle size={17} />
                  </button>
                  <span className="text-sm font-black text-neutral-900 dark:text-white w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <PlusCircle size={17} />
                  </button>
                </div>

                {/* Sub price */}
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-bold text-neutral-950 dark:text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-neutral-400">₹{item.price.toLocaleString("en-IN")} each</p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors rounded"
                  title="Remove from Cart"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* 3. Secure Delivery Address (Mandatory entry on every checkout) */}
        <div id="address-mandated-section" className="border shadow-xs dark:bg-neutral-900/50 dark:border-neutral-800 p-6 rounded-2xl space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-red-600 rounded"></span> Indian Shipping Destination Details
            </h3>
            <span className="text-[10px] bg-red-600/15 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">
              📍 Form Mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left font-sans">
            {/* Recipient Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-name">Recipient Full Name *</label>
              <input
                type="text"
                id="ship-name"
                value={checkoutName}
                onChange={(e) => setCheckoutName(e.target.value)}
                placeholder="e.g. Om Rupchandani"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* Recipient Phone */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-phone">Contact Phone Number *</label>
              <input
                type="tel"
                id="ship-phone"
                value={checkoutPhone}
                onChange={(e) => setCheckoutPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* Recipient Email */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-email">Direct E-mail Address *</label>
              <input
                type="email"
                id="ship-email"
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* House No / Unit */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-house-no">House No. / Flat / Villa *</label>
              <input
                type="text"
                id="ship-house-no"
                value={checkoutHouseNo}
                onChange={(e) => setCheckoutHouseNo(e.target.value)}
                placeholder="e.g. Flat 304, Tower A"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* Building Premise */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-building">Building / Premise Name *</label>
              <input
                type="text"
                id="ship-building"
                value={checkoutBuilding}
                onChange={(e) => setCheckoutBuilding(e.target.value)}
                placeholder="e.g. Prestige Heights Apartments"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* Street / Route */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-street">Street Address / Area / Colony *</label>
              <input
                type="text"
                id="ship-street"
                value={checkoutStreet}
                onChange={(e) => setCheckoutStreet(e.target.value)}
                placeholder="e.g. Pebble Bay Road, Sector-15"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* Landmark */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-neutral-400 block" htmlFor="ship-landmark">Landmark / Nearby Reference *</label>
              <input
                type="text"
                id="ship-landmark"
                value={checkoutLandmark}
                onChange={(e) => setCheckoutLandmark(e.target.value)}
                placeholder="e.g. Adjacent to Royal Metro Station Entrance"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
                required
              />
            </div>

            {/* State */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-neutral-400 block tracking-wider" htmlFor="ship-state">
                State Name (India) *
              </label>
              <div className="relative">
                <select
                  id="ship-state"
                  value={checkoutState}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setCheckoutState(selected);
                    setCheckoutCity("");
                    setIsCustomCity(false);
                  }}
                  className="w-full bg-white dark:bg-neutral-950 p-3 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 font-semibold text-xs tracking-wide appearance-none cursor-pointer transition-all text-neutral-800 dark:text-neutral-200"
                  required
                >
                  <option value="" disabled className="text-neutral-400">-- Choose State / Union Territory --</option>
                  {Object.keys(INDIAN_STATES_CITIES).sort().map((st) => (
                    <option key={st} value={st} className="dark:bg-neutral-900 text-xs py-2">
                      {st}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-neutral-400 block tracking-wider" htmlFor="ship-city">
                  City *
                </label>
                {checkoutState && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCity(!isCustomCity);
                      setCheckoutCity("");
                    }}
                    className="text-[9px] font-black uppercase text-red-500 dark:text-red-400 hover:underline tracking-wider transition-all"
                  >
                    {isCustomCity ? "⚡ Select from List" : "✏️ Custom City"}
                  </button>
                )}
              </div>
              
              {isCustomCity || !checkoutState ? (
                <input
                  type="text"
                  id="ship-city"
                  value={checkoutCity}
                  onChange={(e) => setCheckoutCity(e.target.value)}
                  placeholder={checkoutState ? "Enter city name..." : "Select state first"}
                  disabled={!checkoutState}
                  className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 font-semibold text-xs transition-all text-neutral-800 dark:text-neutral-200 disabled:opacity-50"
                  required
                />
              ) : (
                <div className="relative">
                  <select
                    id="ship-city"
                    value={checkoutCity}
                    onChange={(e) => {
                      if (e.target.value === "__other__") {
                        setIsCustomCity(true);
                        setCheckoutCity("");
                      } else {
                        setCheckoutCity(e.target.value);
                      }
                    }}
                    className="w-full bg-white dark:bg-neutral-950 p-3 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 font-semibold text-xs appearance-none cursor-pointer transition-all text-neutral-800 dark:text-neutral-200"
                    required
                  >
                    <option value="" disabled className="text-neutral-400">-- Choose City --</option>
                    {(INDIAN_STATES_CITIES[checkoutState] || []).sort().map((ct) => (
                      <option key={ct} value={ct} className="dark:bg-neutral-900 text-xs py-2">
                        {ct}
                      </option>
                    ))}
                    <option value="__other__" className="text-red-500 font-bold dark:bg-neutral-900">✏️ Other / Not Listed...</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400 dark:text-neutral-500">
                    <ChevronDown size={16} />
                  </div>
                </div>
              )}
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black text-neutral-500 dark:text-neutral-400 block tracking-wider" htmlFor="ship-pincode">
                6-Digit Indian Pin Code *
              </label>
              <input
                type="text"
                id="ship-pincode"
                value={checkoutZip}
                onChange={(e) => setCheckoutZip(e.target.value.substring(0, 6).replace(/\D/g, ""))}
                placeholder="e.g. 560103"
                className="w-full bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/15 focus:border-red-500 font-mono font-bold tracking-widest text-xs text-neutral-800 dark:text-neutral-200"
                required
              />
              {checkoutZip && checkoutZip.length === 6 && validateIndianAddress(checkoutZip, checkoutState, checkoutCity).isValid && (
                <div className="mt-2 p-3 bg-red-500/[0.04] dark:bg-red-500/[0.02] border border-red-500/25 rounded-xl flex items-center gap-2.5 transition-all animate-fadeIn">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                    <Truck size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                      🚚 Estimated delivery by <span className="text-red-500 font-black">{getDeliveryDateString(checkoutZip, shippingMethod === "priority")}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status Banner */}
          {(aiError || aiSuccess) && (
            <div className={`p-4 rounded-xl text-left border ${
              aiSuccess 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-500 font-bold"
            }`}>
              <div className="font-extrabold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                🛡️ Indian Address AI Registry Verifier
              </div>
              <p className="text-[11px] font-semibold leading-relaxed">
                {aiError || aiSuccess}
              </p>
            </div>
          )}
        </div>

        {/* 4. Secure Payment Gateway Mock Selectors */}
        <div className="border p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white">💳 2. Payment Integration Portal</h3>
            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">COD Mandated Mode</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-950/20 opacity-45 cursor-not-allowed relative overflow-hidden flex flex-col items-center gap-2 select-none"
              title="Locked: Currently deactivated by admin instructions"
            >
              <div className="absolute top-1.5 right-1.5 text-neutral-400">
                <Lock size={12} />
              </div>
              <CreditCard size={20} className="text-neutral-400" />
              <span className="text-xs font-bold leading-none text-neutral-400">Stripe</span>
              <span className="text-[9px] text-neutral-400 font-bold uppercase">🔐 Locked</span>
            </div>

            <div
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-950/20 opacity-45 cursor-not-allowed relative overflow-hidden flex flex-col items-center gap-2 select-none"
              title="Locked: Currently deactivated by admin instructions"
            >
              <div className="absolute top-1.5 right-1.5 text-neutral-400">
                <Lock size={12} />
              </div>
              <FileText size={20} className="text-neutral-400" />
              <span className="text-xs font-bold leading-none text-neutral-400">Razorpay</span>
              <span className="text-[9px] text-neutral-400 font-bold uppercase">🔐 Locked</span>
            </div>



            <button
              onClick={() => setPaymentMethod("cod")}
              type="button"
              className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all border-red-500 bg-red-500/10 text-red-500 shadow-md shadow-red-500/5 relative overflow-hidden"
            >
              <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black px-1.5 rounded-bl uppercase">Active</div>
              <ShoppingBag size={20} />
              <span className="text-xs font-black leading-none">Cash On Delivery</span>
              <span className="text-[9px] text-red-400 font-bold">Standard COD Active</span>
            </button>
          </div>
        </div>

      </div>

      {/* Cart Summary Panel (Right Side) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-2xl text-xs space-y-6 shadow-xs">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 dark:text-white pb-3 border-b">
            NovaMart Receipt Summary
          </h3>

          {/* Delivery speed selector */}
          <div className="space-y-2">
            <p className="font-bold text-neutral-400 uppercase tracking-widest">Delivery Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShippingMethod("standard")}
                className={`p-2 rounded border text-left transition-all ${
                  shippingMethod === "standard"
                    ? "border-neutral-950 font-bold bg-white text-neutral-950 dark:border-white dark:bg-neutral-800 dark:text-white"
                    : "border-neutral-200 text-neutral-500"
                }`}
              >
                <span className="block font-bold">Standard Delivery</span>
                <span className="text-[10px] text-neutral-400">{subtotal >= 500 ? "FREE" : "₹78.00"} (4-5 Days)</span>
              </button>

              <button
                onClick={() => setShippingMethod("priority")}
                className={`p-2 rounded border text-left transition-all ${
                  shippingMethod === "priority"
                    ? "border-neutral-950 font-bold bg-white text-neutral-950 dark:border-white dark:bg-neutral-800 dark:text-white"
                    : "border-neutral-200 text-neutral-500"
                }`}
              >
                <span className="block font-bold">Priority Jet dispatch</span>
                <span className="text-[10px] text-neutral-400">₹150.00 (1-2 Days)</span>
              </button>
            </div>
          </div>

          {/* Coupons apply form */}
          <div className="space-y-2">
            <label className="font-bold text-neutral-400 uppercase tracking-widest block" htmlFor="promo-input">Promo Code Discount</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="promo-input"
                placeholder="e.g. NOVAMART10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white dark:bg-neutral-950 p-2.5 rounded-lg border text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 uppercase font-mono tracking-wider focus:outline-none"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-4 py-2 bg-red-600 font-extrabold hover:bg-red-700 text-white rounded-lg"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
            {activeCoupon && (
              <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-lg flex justify-between items-center mt-1.5">
                <span>Code <strong>{activeCoupon.code}</strong> applied!</span>
                <button onClick={() => setActiveCoupon(null)} className="font-black text-red-500">✕</button>
              </div>
            )}
            <p className="text-[10px] text-neutral-400">Hint: Try applying <strong>FESTIVE20</strong> for 20% savings on larger items or flat <strong>NOVAMART1000</strong>!</p>
          </div>



          {/* Pricing breakdowns */}
          <div className="space-y-2 border-t pt-4 text-neutral-600 dark:text-neutral-300">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-500">
                <span>Promo Discount</span>
                <span>-₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Merchant Delivery Fee</span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {shippingCost === 0 ? "FREE" : `₹${shippingCost.toLocaleString("en-IN")}`}
              </span>
            </div>
            
            {/* Platform Fee & COD Fee explicitly requested rows */}
            <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800/50 pt-2 text-[11px]">
              <span className="text-neutral-500 font-medium">✨ Platform Processing Fee</span>
              <span className="font-bold text-neutral-900 dark:text-white">₹{platformFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500 font-medium">📦 Cash On Delivery (COD) Fee</span>
              <span className="font-bold text-neutral-900 dark:text-white">₹{codFee.toLocaleString("en-IN")}</span>
            </div>
            
            <div className="flex justify-between text-sm text-neutral-900 dark:text-white pt-3 border-t border-dashed font-black">
              <span>Total Payable (COD)</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Ultimate trigger checkout button */}
          <button
            onClick={executeCheckout}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-sm font-black tracking-widest rounded-xl transition-all shadow-md transform hover:scale-[1.01] flex items-center justify-center gap-2 uppercase"
          >
            <Gift size={16} /> Place Secures Order (₹{total.toLocaleString("en-IN")})
          </button>

          <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
            By checking out, you authorize priority instant delivery parameters.
          </p>

        </div>
      </div>

    </div>
  );
}
