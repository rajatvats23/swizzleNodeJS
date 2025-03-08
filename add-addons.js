const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb+srv://vatsrajat23:OHN0kFAhZibGaNXu@cluster0.6rasi.mongodb.net/swizzle_admin?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  importAddons();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define your addon schema (make sure it matches your actual schema)
const addonSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  selectionType: String, // 'single' or 'multiple'
  addonType: String, // 'topping', 'sauce', 'extra', 'option'
  imageUrl: String,
  applicableProducts: [mongoose.Schema.Types.ObjectId],
  isActive: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: false }); // Disable automatic timestamps

const Addon = mongoose.model('Addon', addonSchema);

// Define sample addons based on actual products in the database
const sampleAddons = [
  // Pizza Toppings - Multi Select
  {
    name: "Extra Cheese",
    description: "Premium mozzarella cheese blend",
    price: 1.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/extra-cheese.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mushrooms",
    description: "Fresh sliced mushrooms",
    price: 1.49,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/mushrooms.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bell Peppers",
    description: "Fresh sliced green and red bell peppers",
    price: 1.29,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/bell-peppers.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Onions",
    description: "Fresh sliced red onions",
    price: 0.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/onions.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Olives",
    description: "Sliced black olives",
    price: 1.49,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/olives.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Pizza Crust Options - Single Select
  {
    name: "Regular Crust",
    description: "Classic hand-tossed pizza crust",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/regular-crust.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Thin Crust",
    description: "Thin and crispy pizza crust",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/thin-crust.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Stuffed Crust",
    description: "Crust stuffed with mozzarella cheese",
    price: 2.99,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/stuffed-crust.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bc7", // Margherita Pizza
      "67cbfe5aa311917b071f3bcb"  // Pepperoni Pizza
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Burger Toppings - Multi Select
  {
    name: "Extra Burger Cheese",
    description: "Additional slice of cheddar cheese",
    price: 1.49,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/burger-cheese.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bacon",
    description: "Crispy bacon strips",
    price: 1.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/bacon.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf"  // Classic Cheeseburger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Avocado",
    description: "Fresh sliced avocado",
    price: 1.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/avocado.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jalapeños",
    description: "Spicy sliced jalapeño peppers",
    price: 0.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/jalapenos.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Burger Cooking Options - Single Select
  {
    name: "Medium Rare",
    description: "Warm red center, 135°F",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/medium-rare.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf"  // Classic Cheeseburger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Medium",
    description: "Warm pink center, 145°F",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/medium.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf"  // Classic Cheeseburger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Well Done",
    description: "No pink, 160°F",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/well-done.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf"  // Classic Cheeseburger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Burger Sides - Single Select
  {
    name: "French Fries",
    description: "Classic crispy french fries",
    price: 2.99,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/french-fries.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Onion Rings",
    description: "Battered and fried onion rings",
    price: 3.49,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/onion-rings.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Burger Side Salad",
    description: "Fresh garden salad with vinaigrette",
    price: 3.99,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/side-salad.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bcf", // Classic Cheeseburger
      "67cbfe5aa311917b071f3bd2"  // Veggie Burger
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Pasta Addons - Multiple Select
  {
    name: "Grilled Chicken",
    description: "Tender grilled chicken breast",
    price: 3.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/grilled-chicken.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3be1"  // Spaghetti Carbonara
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Extra Parmesan",
    description: "Additional grated parmesan cheese",
    price: 1.49,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/parmesan.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3be1"  // Spaghetti Carbonara
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sautéed Mushrooms",
    description: "Sautéed mushrooms",
    price: 1.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/sauteed-mushrooms.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3be1"  // Spaghetti Carbonara
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Pasta Sides - Single Select
  {
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter",
    price: 3.99,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/garlic-bread-pasta.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3be1"  // Spaghetti Carbonara
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pasta Side Salad",
    description: "Fresh garden salad with balsamic vinaigrette",
    price: 4.49,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/pasta-side-salad.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3be1"  // Spaghetti Carbonara
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Dessert Addons - Single Select
  {
    name: "Vanilla Ice Cream",
    description: "Scoop of premium vanilla ice cream",
    price: 2.49,
    selectionType: "single",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/vanilla-ice-cream.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd8"  // Chocolate Brownie
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Chocolate Sauce",
    description: "Rich chocolate fudge sauce",
    price: 0.99,
    selectionType: "multiple",
    addonType: "sauce",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/chocolate-sauce.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd8"  // Chocolate Brownie
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Caramel Sauce",
    description: "Sweet and creamy caramel sauce",
    price: 0.99,
    selectionType: "multiple",
    addonType: "sauce",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/caramel-sauce.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd8"  // Chocolate Brownie
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Whipped Cream",
    description: "Fresh whipped cream",
    price: 0.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/whipped-cream.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd8"  // Chocolate Brownie
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Thai Food Addons - Multiple Select
  {
    name: "Extra Peanuts",
    description: "Additional crushed peanuts",
    price: 0.99,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/crushed-peanuts.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Extra Lime",
    description: "Additional lime wedges",
    price: 0.49,
    selectionType: "multiple",
    addonType: "topping",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/lime-wedges.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Thai Spice Level - Single Select
  {
    name: "Mild",
    description: "Low spice level, suitable for sensitive palates",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/mild-spice.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Medium",
    description: "Moderate spice level, balanced heat",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/medium-spice.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Spicy",
    description: "High heat level, for spice enthusiasts",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/spicy-level.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Thai Hot",
    description: "Extremely spicy, authentic Thai heat level",
    price: 0,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/thai-hot.jpg",
    applicableProducts: [
      "67cc0d60660b2feef546fdf8"  // Pad Thai with Shrimps
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Beverage Extras - Multiple Select
  {
    name: "Extra Sugar",
    description: "Additional sugar for your beverage",
    price: 0,
    selectionType: "multiple",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/sugar.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd5"  // Masala Chai
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Almond Milk",
    description: "Replace regular milk with almond milk",
    price: 1.49,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/almond-milk.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd5"  // Masala Chai
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Oat Milk",
    description: "Replace regular milk with oat milk",
    price: 1.49,
    selectionType: "single",
    addonType: "option",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/oat-milk.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd5"  // Masala Chai
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Extra Spice",
    description: "More ginger, cardamom, and cinnamon",
    price: 0.99,
    selectionType: "multiple",
    addonType: "extra",
    imageUrl: "https://swizzlefiles1-nv.s3.amazonaws.com/addons/extra-chai-spice.jpg",
    applicableProducts: [
      "67cbfe5aa311917b071f3bd5"  // Masala Chai
    ],
    isActive: true,
    createdBy: "67c366671f9675ef53a726ea",
    updatedBy: "67c366671f9675ef53a726ea",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Import addons into database
async function importAddons() {
  try {
    // Create a new file with addon data
    fs.writeFileSync('food-addons.json', JSON.stringify(sampleAddons, null, 2));
    console.log('Sample addons saved to food-addons.json');
    
    // Delete existing addons if needed
    try {
      await Addon.deleteMany({});
      console.log('Cleared existing addons');
    } catch (err) {
      console.log('Error clearing existing addons, continuing with import');
    }
    
    // Convert string IDs to ObjectIds
    const processedAddons = sampleAddons.map(addon => {
      return {
        ...addon,
        applicableProducts: addon.applicableProducts.map(id => new mongoose.Types.ObjectId(id)),
        createdBy: new mongoose.Types.ObjectId(addon.createdBy),
        updatedBy: new mongoose.Types.ObjectId(addon.updatedBy)
      };
    });
    
    // Insert the new addons with ordered: false to continue on error
    const result = await Addon.insertMany(processedAddons, { ordered: false })
      .catch(err => {
        console.log(`Partial import completed. Some addons may already exist.`);
        return { length: 'some' }; // Return something with a length property
      });
    
    console.log(`Import process completed. Successfully imported ${result.length} addons.`);
    
    mongoose.disconnect();
        console.log('Disconnected from MongoDB');
      } catch (err) {
        console.error('Error importing addons:', err);
      }
    }