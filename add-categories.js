const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb+srv://vatsrajat23:OHN0kFAhZibGaNXu@cluster0.6rasi.mongodb.net/swizzle_admin?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  importCategories();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define your category schema
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  isActive: Boolean,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}, { timestamps: false }); // Disable automatic timestamps

const Category = mongoose.model('Category', categorySchema);

// Import the data
async function importCategories() {
  try {
    // Read the JSON file
    const categoriesRaw = fs.readFileSync('food-categories.json', 'utf8');
    const categories = JSON.parse(categoriesRaw);
    
    console.log(`Found ${categories.length} categories to import`);
    
    // Convert string IDs to ObjectIds
    const processedCategories = categories.map(category => {
      return {
        ...category,
        createdBy: new mongoose.Types.ObjectId(category.createdBy),
        updatedBy: new mongoose.Types.ObjectId(category.updatedBy)
      };
    });
    
    // Delete existing data if needed
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert the new data
    const result = await Category.insertMany(processedCategories);
    console.log(`Successfully imported ${result.length} categories`);
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error importing data:', error);
    mongoose.disconnect();
  }
}