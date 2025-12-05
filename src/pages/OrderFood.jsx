import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function OrderFood() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentTiming, setPaymentTiming] = useState('before'); // 'before' or 'after'
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const deliveryFee = 5.99;

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      setUser(userData);
    } catch (e) {
      // ignore
    }
  }, []);

  const foodItems = [
    // Main Dishes
    { id: 1, name: 'Classic Burger', category: 'main', price: 12.99, description: 'Beef patty, lettuce, tomato, cheese, pickles', image: '🍔' },
    { id: 2, name: 'Chicken Caesar Salad', category: 'main', price: 11.99, description: 'Grilled chicken, romaine lettuce, parmesan, croutons', image: '🥗' },
    { id: 3, name: 'Margherita Pizza', category: 'main', price: 14.99, description: 'Fresh mozzarella, basil, tomato sauce', image: '🍕' },
    { id: 4, name: 'Fish Tacos', category: 'main', price: 13.99, description: 'Grilled fish, cabbage slaw, avocado cream', image: '🌮' },
    { id: 5, name: 'Beef Stir Fry', category: 'main', price: 15.99, description: 'Tender beef, mixed vegetables, jasmine rice', image: '🥘' },
    { id: 6, name: 'Chicken Sandwich', category: 'main', price: 10.99, description: 'Crispy chicken, mayo, lettuce on brioche bun', image: '🥪' },
    { id: 7, name: 'Vegetable Curry', category: 'main', price: 12.49, description: 'Mixed vegetables in coconut curry sauce', image: '🍛' },
    { id: 8, name: 'BBQ Ribs', category: 'main', price: 18.99, description: 'Fall-off-the-bone ribs with house BBQ sauce', image: '🍖' },
    { id: 9, name: 'Salmon Teriyaki', category: 'main', price: 17.99, description: 'Grilled salmon with teriyaki glaze', image: '🍣' },
    { id: 10, name: 'Pasta Carbonara', category: 'main', price: 13.99, description: 'Creamy pasta with bacon and parmesan', image: '🍝' },
    { id: 11, name: 'Turkey Club', category: 'main', price: 11.49, description: 'Turkey, bacon, lettuce, tomato on toast', image: '🥪' },
    { id: 12, name: 'Veggie Burger', category: 'main', price: 11.99, description: 'Plant-based patty with all the fixings', image: '🍔' },
    { id: 13, name: 'Chicken Wings', category: 'appetizer', price: 9.99, description: 'Buffalo wings with celery and blue cheese', image: '🍗' },
    { id: 14, name: 'Beef Quesadilla', category: 'main', price: 12.99, description: 'Seasoned beef and cheese in tortilla', image: '🌯' },
    { id: 15, name: 'Sushi Platter', category: 'main', price: 19.99, description: 'Assorted fresh sushi and sashimi', image: '🍱' },
    { id: 16, name: 'Chicken Parmesan', category: 'main', price: 16.99, description: 'Breaded chicken with marinara and mozzarella', image: '🍗' },
    { id: 17, name: 'Greek Salad', category: 'main', price: 10.99, description: 'Olives, feta, cucumbers, tomatoes', image: '🥗' },
    { id: 18, name: 'Pulled Pork Sandwich', category: 'main', price: 13.49, description: 'Slow-cooked pulled pork with coleslaw', image: '🥪' },
    { id: 19, name: 'Shrimp Scampi', category: 'main', price: 16.99, description: 'Garlic butter shrimp over linguine', image: '🍤' },
    { id: 20, name: 'Mushroom Risotto', category: 'main', price: 14.99, description: 'Creamy arborio rice with wild mushrooms', image: '🍚' },
    { id: 21, name: 'Fish & Chips', category: 'main', price: 15.49, description: 'Beer-battered fish with thick-cut fries', image: '🍟' },
    { id: 22, name: 'Chicken Fajitas', category: 'main', price: 14.99, description: 'Sizzling chicken with peppers and onions', image: '🌮' },
    { id: 23, name: 'Beef Burrito', category: 'main', price: 12.99, description: 'Seasoned beef, rice, beans, cheese', image: '🌯' },
    { id: 24, name: 'Lobster Roll', category: 'main', price: 21.99, description: 'Fresh lobster meat on toasted roll', image: '🦞' },
    { id: 25, name: 'Chicken Tikka Masala', category: 'main', price: 15.99, description: 'Tender chicken in creamy tomato curry', image: '🍛' },
    
    // Appetizers
    { id: 26, name: 'Mozzarella Sticks', category: 'appetizer', price: 7.99, description: 'Crispy breaded mozzarella with marinara', image: '🧀' },
    { id: 27, name: 'Onion Rings', category: 'appetizer', price: 6.99, description: 'Beer-battered onion rings with ranch', image: '🧅' },
    { id: 28, name: 'Nachos Supreme', category: 'appetizer', price: 9.99, description: 'Loaded nachos with cheese, jalapeños, sour cream', image: '🌶️' },
    { id: 29, name: 'Spinach Artichoke Dip', category: 'appetizer', price: 8.99, description: 'Hot cheesy dip with tortilla chips', image: '🥬' },
    { id: 30, name: 'Calamari Rings', category: 'appetizer', price: 10.99, description: 'Crispy squid rings with marinara sauce', image: '🦑' },
    { id: 31, name: 'Chicken Tenders', category: 'appetizer', price: 8.49, description: 'Crispy chicken strips with honey mustard', image: '🍗' },
    { id: 32, name: 'Loaded Potato Skins', category: 'appetizer', price: 9.49, description: 'Bacon, cheese, chives with sour cream', image: '🥔' },
    { id: 33, name: 'Stuffed Jalapeños', category: 'appetizer', price: 7.99, description: 'Cream cheese filled jalapeños wrapped in bacon', image: '🌶️' },
    { id: 34, name: 'Bruschetta', category: 'appetizer', price: 7.49, description: 'Toasted bread with tomato, basil, garlic', image: '🍅' },
    { id: 35, name: 'Shrimp Cocktail', category: 'appetizer', price: 11.99, description: 'Chilled shrimp with cocktail sauce', image: '🍤' },
    
    // Desserts
    { id: 36, name: 'Chocolate Cake', category: 'dessert', price: 6.99, description: 'Rich chocolate layer cake with frosting', image: '🍰' },
    { id: 37, name: 'Cheesecake', category: 'dessert', price: 6.49, description: 'New York style with berry compote', image: '🍰' },
    { id: 38, name: 'Ice Cream Sundae', category: 'dessert', price: 5.99, description: 'Vanilla ice cream with hot fudge and cherry', image: '🍨' },
    { id: 39, name: 'Apple Pie', category: 'dessert', price: 5.49, description: 'Classic apple pie with cinnamon', image: '🥧' },
    { id: 40, name: 'Tiramisu', category: 'dessert', price: 7.49, description: 'Italian coffee-flavored dessert', image: '🍮' },
    { id: 41, name: 'Brownies', category: 'dessert', price: 4.99, description: 'Fudgy chocolate brownies', image: '🍫' },
    { id: 42, name: 'Crème Brûlée', category: 'dessert', price: 7.99, description: 'Vanilla custard with caramelized sugar', image: '🍮' },
    { id: 43, name: 'Fruit Tart', category: 'dessert', price: 6.99, description: 'Fresh seasonal fruit on pastry cream', image: '🥧' },
    { id: 44, name: 'Chocolate Mousse', category: 'dessert', price: 6.49, description: 'Light and airy chocolate mousse', image: '🍫' },
    { id: 45, name: 'Banana Foster', category: 'dessert', price: 8.99, description: 'Flambéed bananas with vanilla ice cream', image: '🍌' },
    
    // Asian Cuisine
    { id: 46, name: 'Pad Thai', category: 'main', price: 13.99, description: 'Thai rice noodles with shrimp and peanuts', image: '🍜' },
    { id: 47, name: 'General Tso Chicken', category: 'main', price: 14.99, description: 'Sweet and spicy crispy chicken', image: '🥘' },
    { id: 48, name: 'Beef Lo Mein', category: 'main', price: 13.49, description: 'Soft noodles with beef and vegetables', image: '🍜' },
    { id: 49, name: 'Chicken Fried Rice', category: 'main', price: 11.99, description: 'Wok-fried rice with chicken and vegetables', image: '🍚' },
    { id: 50, name: 'Sweet & Sour Pork', category: 'main', price: 13.99, description: 'Crispy pork with pineapple and peppers', image: '🍖' },
    
    // Mexican Food
    { id: 51, name: 'Chicken Enchiladas', category: 'main', price: 13.99, description: 'Rolled tortillas with chicken and cheese sauce', image: '🌯' },
    { id: 52, name: 'Beef Nachos', category: 'appetizer', price: 10.99, description: 'Tortilla chips with seasoned beef and cheese', image: '🌶️' },
    { id: 53, name: 'Fish Burrito Bowl', category: 'main', price: 14.49, description: 'Grilled fish over rice with black beans', image: '🍚' },
    { id: 54, name: 'Carnitas Tacos', category: 'main', price: 12.99, description: 'Slow-cooked pork in corn tortillas', image: '🌮' },
    { id: 55, name: 'Vegetable Quesadilla', category: 'main', price: 10.99, description: 'Grilled vegetables and cheese in tortilla', image: '🌯' },
    
    // Italian Specialties
    { id: 56, name: 'Lasagna', category: 'main', price: 15.99, description: 'Layered pasta with meat sauce and cheese', image: '🍝' },
    { id: 57, name: 'Chicken Alfredo', category: 'main', price: 16.99, description: 'Fettuccine with grilled chicken in cream sauce', image: '🍝' },
    { id: 58, name: 'Pepperoni Pizza', category: 'main', price: 15.99, description: 'Classic pepperoni with mozzarella cheese', image: '🍕' },
    { id: 59, name: 'Caprese Salad', category: 'appetizer', price: 9.99, description: 'Fresh mozzarella, tomato, basil', image: '🍅' },
    { id: 60, name: 'Garlic Bread', category: 'appetizer', price: 5.99, description: 'Toasted bread with garlic butter and herbs', image: '🥖' },
    
    // American Classics
    { id: 61, name: 'Philly Cheesesteak', category: 'main', price: 13.99, description: 'Sliced beef with cheese on hoagie roll', image: '🥪' },
    { id: 62, name: 'Chicago Deep Dish', category: 'main', price: 17.99, description: 'Thick crust pizza with chunky tomato sauce', image: '🍕' },
    { id: 63, name: 'Buffalo Mac & Cheese', category: 'main', price: 12.99, description: 'Mac and cheese with buffalo chicken', image: '🧀' },
    { id: 64, name: 'Loaded Chili Dog', category: 'main', price: 9.99, description: 'Hot dog with chili, cheese, and onions', image: '🌭' },
    { id: 65, name: 'Country Fried Steak', category: 'main', price: 16.99, description: 'Breaded steak with country gravy', image: '🍖' },
    
    // African Traditional Dishes
    { id: 66, name: 'Ugali', category: 'main', price: 8.99, description: 'Traditional cornmeal staple served with vegetables', image: '🌽' },
    { id: 67, name: 'Samaki wa Kupaka', category: 'main', price: 16.99, description: 'Fish in rich coconut curry sauce with spices', image: '🐟' },
    { id: 68, name: 'Mokimo', category: 'main', price: 11.99, description: 'Mashed green peas, potatoes, maize and greens', image: '🥔' },
  ];

  const drinkItems = [
    // Soft Drinks
    { id: 101, name: 'Coca Cola', category: 'soft-drink', price: 2.99, description: 'Classic cola soda', image: '🥤' },
    { id: 102, name: 'Pepsi', category: 'soft-drink', price: 2.99, description: 'Refreshing cola drink', image: '🥤' },
    { id: 103, name: 'Sprite', category: 'soft-drink', price: 2.99, description: 'Lemon-lime soda', image: '🥤' },
    { id: 104, name: 'Orange Fanta', category: 'soft-drink', price: 2.99, description: 'Orange flavored soda', image: '🥤' },
    { id: 105, name: 'Dr Pepper', category: 'soft-drink', price: 2.99, description: 'Unique blend of 23 flavors', image: '🥤' },
    { id: 106, name: 'Root Beer', category: 'soft-drink', price: 2.99, description: 'Classic American root beer', image: '🥤' },
    { id: 107, name: 'Ginger Ale', category: 'soft-drink', price: 2.99, description: 'Crisp ginger flavored soda', image: '🥤' },
    { id: 108, name: 'Mountain Dew', category: 'soft-drink', price: 2.99, description: 'Citrus flavored energy drink', image: '🥤' },
    
    // Juices
    { id: 109, name: 'Orange Juice', category: 'juice', price: 3.49, description: 'Fresh squeezed orange juice', image: '🍊' },
    { id: 110, name: 'Apple Juice', category: 'juice', price: 3.49, description: '100% pure apple juice', image: '🍎' },
    { id: 111, name: 'Cranberry Juice', category: 'juice', price: 3.49, description: 'Tart cranberry juice', image: '🫐' },
    { id: 112, name: 'Pineapple Juice', category: 'juice', price: 3.49, description: 'Tropical pineapple juice', image: '🍍' },
    { id: 113, name: 'Grape Juice', category: 'juice', price: 3.49, description: 'Sweet purple grape juice', image: '🍇' },
    { id: 114, name: 'Tomato Juice', category: 'juice', price: 3.49, description: 'Fresh tomato juice with spices', image: '🍅' },
    { id: 115, name: 'Mango Juice', category: 'juice', price: 3.99, description: 'Exotic mango juice', image: '🥭' },
    
    // Coffee & Tea
    { id: 116, name: 'Espresso', category: 'coffee', price: 2.49, description: 'Rich Italian espresso shot', image: '☕' },
    { id: 117, name: 'Cappuccino', category: 'coffee', price: 4.49, description: 'Espresso with steamed milk and foam', image: '☕' },
    { id: 118, name: 'Latte', category: 'coffee', price: 4.99, description: 'Espresso with steamed milk', image: '☕' },
    { id: 119, name: 'Americano', category: 'coffee', price: 3.49, description: 'Espresso with hot water', image: '☕' },
    { id: 120, name: 'Mocha', category: 'coffee', price: 5.49, description: 'Chocolate espresso drink', image: '☕' },
    { id: 121, name: 'Green Tea', category: 'tea', price: 2.99, description: 'Antioxidant-rich green tea', image: '🍵' },
    { id: 122, name: 'Earl Grey Tea', category: 'tea', price: 2.99, description: 'Classic bergamot-flavored black tea', image: '🍵' },
    { id: 123, name: 'Chamomile Tea', category: 'tea', price: 2.99, description: 'Relaxing herbal tea', image: '🍵' },
    { id: 124, name: 'Iced Coffee', category: 'coffee', price: 3.99, description: 'Cold brew coffee over ice', image: '🧊' },
    
    // Smoothies & Shakes
    { id: 125, name: 'Strawberry Smoothie', category: 'smoothie', price: 5.99, description: 'Fresh strawberries and yogurt', image: '🍓' },
    { id: 126, name: 'Mango Smoothie', category: 'smoothie', price: 5.99, description: 'Tropical mango blend', image: '🥭' },
    { id: 127, name: 'Chocolate Milkshake', category: 'smoothie', price: 5.49, description: 'Rich chocolate ice cream shake', image: '🍫' },
    { id: 128, name: 'Vanilla Milkshake', category: 'smoothie', price: 5.49, description: 'Classic vanilla ice cream shake', image: '🍦' },
    { id: 129, name: 'Berry Blast Smoothie', category: 'smoothie', price: 6.49, description: 'Mixed berries with protein powder', image: '🫐' },
    { id: 130, name: 'Green Smoothie', category: 'smoothie', price: 6.99, description: 'Spinach, apple, banana, and ginger', image: '🥬' },
  ];

  const allItems = [...foodItems, ...drinkItems];

  const categories = [
    { id: 'all', name: 'All Items', icon: '🍽️' },
    { id: 'main', name: 'Main Dishes', icon: '🍝' },
    { id: 'appetizer', name: 'Appetizers', icon: '🥗' },
    { id: 'dessert', name: 'Desserts', icon: '🍰' },
    { id: 'soft-drink', name: 'Soft Drinks', icon: '🥤' },
    { id: 'juice', name: 'Juices', icon: '🍊' },
    { id: 'coffee', name: 'Coffee', icon: '☕' },
    { id: 'tea', name: 'Tea', icon: '🍵' },
    { id: 'smoothie', name: 'Smoothies', icon: '🥤' },
  ];

  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalWithDelivery = () => {
    return getCartTotal() + deliveryFee;
  };

  const handleProceedToPayment = () => {
    if (!deliveryAddress.trim()) {
      alert('Please enter a delivery address');
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmOrder = () => {
    setIsOrdering(true);
    setShowPaymentModal(false);
    
    // Simulate order processing
    setTimeout(() => {
      const order = {
        id: 'ORD-' + Date.now(),
        items: cart,
        subtotal: getCartTotal(),
        deliveryFee: deliveryFee,
        total: getTotalWithDelivery(),
        deliveryAddress,
        orderNotes,
        paymentTiming,
        paymentMethod,
        customer: user,
        orderTime: new Date().toISOString(),
        status: paymentTiming === 'before' ? 'Payment Required' : 'Confirmed',
        paymentStatus: paymentTiming === 'before' ? 'Pending' : 'Cash on Delivery',
        estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString() // 45 minutes
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      existingOrders.unshift(order);
      localStorage.setItem('foodOrders', JSON.stringify(existingOrders));

      setShowOrderConfirmation(true);
      setCart([]);
      setDeliveryAddress('');
      setOrderNotes('');
      setShowCart(false);
      setIsOrdering(false);
    }, 2000);
  };

  const processPayment = () => {
    if (paymentTiming === 'before') {
      // Navigate to payment page with order data
      const orderData = {
        items: cart,
        subtotal: getCartTotal(),
        deliveryFee: deliveryFee,
        total: getTotalWithDelivery(),
        deliveryAddress,
        orderNotes,
        paymentTiming,
        customer: user
      };
      navigate('/food-payment', { state: { orderData } });
    } else {
      // Process as cash on delivery
      const order = {
        id: 'ORD-' + Date.now(),
        items: cart,
        subtotal: getCartTotal(),
        deliveryFee: deliveryFee,
        total: getTotalWithDelivery(),
        deliveryAddress,
        orderNotes,
        paymentTiming: 'after',
        paymentMethod: 'cash',
        customer: user,
        orderTime: new Date().toISOString(),
        status: 'Order Placed',
        paymentStatus: 'Cash on Delivery'
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('foodOrders') || '[]');
      existingOrders.unshift(order);
      localStorage.setItem('foodOrders', JSON.stringify(existingOrders));
      
      setCart([]);
      setDeliveryAddress('');
      setOrderNotes('');
      setShowCart(false);
      alert('Order placed successfully! Payment will be collected on delivery.');
    }
  };



  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }
      `}</style>
      <Layout>
        <div className="min-h-screen bg-[#6A0DAD] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <BackButton />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🍕 Order Food & Drinks</h1>
            <p className="text-slate-300">Fresh food delivered to your door</p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">Delivery Fee: ${deliveryFee}</span>
              </div>
              <button 
                onClick={() => setShowCart(true)}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-white font-medium transition-colors relative"
              >
                🛒 Cart ({cart.length})
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search food and drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filters */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="glass-card p-4 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 transition-all">
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.image}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-slate-300 text-sm mb-2">{item.description}</p>
                  <div className="text-2xl font-bold text-orange-400">${item.price}</div>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
              <p className="text-slate-300">Try adjusting your search or category filter</p>
            </div>
          )}

          {/* Cart Modal */}
          {showCart && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 border-b shrink-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">Your Cart</h2>
                    <button 
                      onClick={() => setShowCart(false)}
                      className="text-slate-500 hover:text-slate-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Items Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🛒</div>
                        <p className="text-slate-600">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.image}</span>
                              <div>
                                <h4 className="font-medium text-slate-900">{item.name}</h4>
                                <p className="text-slate-600 text-sm">${item.price} each</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed Footer with Payment Details */}
                {cart.length > 0 && (
                  <div className="shrink-0 p-6 border-t bg-slate-50">
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        placeholder="Delivery address *"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <textarea
                        placeholder="Special instructions (optional)"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        rows={2}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div className="space-y-2 mb-4 bg-white p-4 rounded-lg border">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Fee:</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2">
                        <span>Total:</span>
                        <span>${getTotalWithDelivery().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleProceedToPayment}
                      disabled={isOrdering || !deliveryAddress.trim()}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {isOrdering ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method & Timing Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowPaymentModal(false)}></div>
              <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">🍽️ Payment Options</h3>
                  <p className="text-slate-600">Choose when and how to pay for your order</p>
                </div>

                {/* Payment Timing Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Payment Timing</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="paymentTiming"
                        value="before"
                        checked={paymentTiming === 'before'}
                        onChange={(e) => setPaymentTiming(e.target.value)}
                        className="text-orange-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">💳 Pay Before Delivery</div>
                        <div className="text-sm text-slate-600">Secure online payment now</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="paymentTiming"
                        value="after"
                        checked={paymentTiming === 'after'}
                        onChange={(e) => setPaymentTiming(e.target.value)}
                        className="text-orange-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">💵 Pay After Delivery</div>
                        <div className="text-sm text-slate-600">Cash payment to delivery person</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'mpesa', name: 'M-Pesa', icon: '📱', disabled: paymentTiming === 'after' },
                      { id: 'paypal', name: 'PayPal', icon: '🌐', disabled: paymentTiming === 'after' },
                      { id: 'creditcard', name: 'Credit Card', icon: '💳', disabled: paymentTiming === 'after' },
                      { id: 'debitcard', name: 'Debit Card', icon: '💳', disabled: paymentTiming === 'after' },
                      { id: 'mastercard', name: 'Mastercard', icon: '💳', disabled: paymentTiming === 'after' },
                      { id: 'googlepay', name: 'Google Pay', icon: '📲', disabled: paymentTiming === 'after' },
                      { id: 'crypto', name: 'Crypto', icon: '₿', disabled: paymentTiming === 'after' },
                      { id: 'cash', name: 'Cash', icon: '💵', disabled: paymentTiming === 'before' }
                    ].map(method => (
                      <label
                        key={method.id}
                        className={`flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                          method.disabled 
                            ? 'opacity-50 cursor-not-allowed bg-slate-100' 
                            : paymentMethod === method.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          disabled={method.disabled}
                          className="sr-only"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-sm font-medium text-slate-900">{method.name}</span>
                      </label>
                    ))}
                  </div>
                  {paymentTiming === 'after' && (
                    <p className="text-sm text-slate-500 mt-2 text-center">
                      Cash payment only available for pay after delivery
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${getTotalWithDelivery().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isOrdering}
                    className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white rounded-lg font-bold transition-colors"
                  >
                    {isOrdering ? 'Processing...' : paymentTiming === 'before' ? 'Continue to Payment' : 'Confirm Order'}
                  </button>
                </div>
              </div>
            </div>
          )}




        </div>
      </div>
    </Layout>
    </>
  );
}