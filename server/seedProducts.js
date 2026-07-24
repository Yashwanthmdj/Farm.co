const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const demoProducts = [
  // Seeds
  {
    name: 'Tomato Hybrid Seed – NS-815',
    brand: 'Nuziveedu Seeds',
    category: 'Seeds',
    subCategory: 'Vegetables',
    type: 'Hybrid',
    description: 'High-yielding hybrid tomato seed. Suitable for all seasons. Disease resistant and early maturing. Produces uniform, firm fruits with excellent shelf life.',
    image: 'https://www.ugaoo.com/cdn/shop/products/Tomato-Hybrid-Seeds.jpg',
    price: 120,
    stock: 100,
    usage: 'Sow 50g per acre in well-prepared soil. Maintain 60cm row spacing.',
    cropType: ['Tomato'],
    isBestSeller: true,
    isNewArrival: false,
    dosage: '50g/acre',
    unit: 'pack'
  },
  {
    name: 'Cotton Seed – Bollgard II',
    brand: 'Rasi Seeds',
    category: 'Seeds',
    subCategory: 'Cash Crops',
    type: 'GM Hybrid',
    description: 'Genetically modified cotton seed with high resistance to bollworms. Suitable for irrigated and rainfed conditions.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2022/7/VD/GL/GL/1517266/bollgard-ii-cotton-seeds-500x500.jpg',
    price: 350,
    stock: 80,
    usage: 'Sow 450g per acre. Ensure proper field drainage.',
    cropType: ['Cotton'],
    isBestSeller: true,
    isNewArrival: true,
    dosage: '450g/acre',
    unit: 'pack'
  },
  {
    name: 'Paddy MTU-1010',
    brand: 'Kaveri Seeds',
    category: 'Seeds',
    subCategory: 'Cereals',
    type: 'Certified',
    description: 'Popular paddy seed for high yield. Tolerant to major pests and diseases. Suitable for both direct sowing and transplanting.',
    image: 'https://www.kaveriseeds.in/wp-content/uploads/2020/09/MTU-1010.jpg',
    price: 90,
    stock: 120,
    usage: 'Use 20kg per acre. Maintain 20cm plant spacing.',
    cropType: ['Paddy'],
    isBestSeller: false,
    isNewArrival: false,
    dosage: '20kg/acre',
    unit: 'bag'
  },
  {
    name: 'Organic Vegetable Seed Kit',
    brand: 'Ugaoo',
    category: 'Seeds',
    subCategory: 'Vegetables',
    type: 'Organic',
    description: 'A complete kit of organic seeds for home and kitchen gardens. Includes tomato, brinjal, chilli, and onion seeds.',
    image: 'https://www.ugaoo.com/cdn/shop/products/Organic-Vegetable-Seed-Kit.jpg',
    price: 250,
    stock: 60,
    usage: 'Sow as per instructions in the kit. Ideal for pots and raised beds.',
    cropType: ['Tomato', 'Brinjal', 'Chilli', 'Onion'],
    isBestSeller: false,
    isNewArrival: true,
    dosage: 'Varies',
    unit: 'kit'
  },
  {
    name: 'Sunflower Hybrid Seed',
    brand: 'Advanta',
    category: 'Seeds',
    subCategory: 'Oilseeds',
    type: 'Hybrid',
    description: 'High-yielding sunflower hybrid with excellent oil content. Suitable for all soil types.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/sunflower-hybrid-seeds-500x500.jpg',
    price: 180,
    stock: 60,
    usage: 'Sow 2kg per acre. Maintain 45cm plant spacing.',
    cropType: ['Sunflower'],
    isBestSeller: false,
    isNewArrival: true,
    dosage: '2kg/acre',
    unit: 'pack'
  },
  // Fertilizers
  {
    name: 'Urea Fertilizer (46% N)',
    brand: 'IFFCO',
    category: 'Fertilizers',
    subCategory: 'Macronutrients',
    type: 'Granular',
    description: 'Nitrogen-rich urea fertilizer for rapid vegetative growth. Suitable for all crops.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/urea-fertilizer-500x500.jpg',
    price: 350,
    stock: 200,
    usage: 'Apply 50kg per acre as basal or top dressing.',
    cropType: ['Paddy', 'Wheat', 'Maize', 'Cotton'],
    isBestSeller: true,
    isNewArrival: false,
    dosage: '50kg/acre',
    unit: 'bag'
  },
  {
    name: 'Vermicompost Organic',
    brand: 'Anil BioFertilizers',
    category: 'Fertilizers',
    subCategory: 'Compost & Manure',
    type: 'Compost',
    description: 'Organic vermicompost for soil health. Improves soil structure and water retention.',
    image: 'https://www.ugaoo.com/cdn/shop/products/Vermicompost-Organic.jpg',
    price: 300,
    stock: 60,
    usage: 'Apply 100kg per acre. Mix well into the soil.',
    cropType: ['Tomato', 'Brinjal', 'Chilli', 'Onion', 'Paddy', 'Wheat'],
    isBestSeller: false,
    isNewArrival: false,
    dosage: '100kg/acre',
    unit: 'bag'
  },
  // Pesticides
  {
    name: 'Confidor (Imidacloprid 17.8 SL)',
    brand: 'Bayer',
    category: 'Pesticides',
    subCategory: 'Insecticides',
    type: 'Insecticide',
    description: 'Systemic insecticide for control of sucking pests in cotton, vegetables, and fruits.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/confidor-insecticide-500x500.jpg',
    price: 650,
    stock: 50,
    usage: 'Dilute 100ml in 200L water per acre. Spray uniformly.',
    cropType: ['Cotton', 'Tomato', 'Brinjal'],
    isBestSeller: true,
    isNewArrival: false,
    dosage: '100ml/acre',
    unit: 'bottle'
  },
  {
    name: 'Neem Oil 1500 PPM',
    brand: 'Biotech',
    category: 'Pesticides',
    subCategory: 'Bio-pesticides',
    type: 'Bio-pesticide',
    description: 'Organic pest control for vegetables and fruits. Safe for beneficial insects.',
    image: 'https://www.ugaoo.com/cdn/shop/products/Neem-Oil-1500-PPM.jpg',
    price: 350,
    stock: 60,
    usage: 'Mix 500ml in 200L water per acre. Spray on both sides of leaves.',
    cropType: ['Tomato', 'Brinjal', 'Chilli', 'Onion'],
    isBestSeller: false,
    isNewArrival: true,
    dosage: '500ml/acre',
    unit: 'bottle'
  },
  // Tools & Equipment
  {
    name: 'Knapsack Sprayer – 16L',
    brand: 'Kisankraft',
    category: 'Tools',
    subCategory: 'Sprayers',
    type: 'Manual',
    description: 'Manual sprayer for pesticides and fertilizers. Durable and easy to use.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/knapsack-sprayer-16l-500x500.jpg',
    price: 1200,
    stock: 25,
    usage: 'Fill tank with solution and spray evenly over crops.',
    cropType: ['Paddy', 'Wheat', 'Maize', 'Cotton', 'Tomato'],
    isBestSeller: false,
    isNewArrival: false,
    dosage: '',
    unit: 'piece'
  },
  // Protective Gear
  {
    name: 'N95 Mask (pack of 10)',
    brand: '3M',
    category: 'Protective Gear',
    subCategory: 'Masks',
    type: 'N95',
    description: 'N95 mask for dust and pesticide protection. Comfortable fit and high filtration.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/n95-mask-500x500.jpg',
    price: 500,
    stock: 30,
    usage: 'Wear during spraying or dusty field work.',
    cropType: [],
    isBestSeller: false,
    isNewArrival: false,
    dosage: '',
    unit: 'pack'
  },
  // Packaging Items
  {
    name: 'HDPE Woven Sack – 50 kg',
    brand: 'Generic',
    category: 'Packaging',
    subCategory: 'Sacks/Bags',
    type: 'HDPE',
    description: '50kg HDPE woven sack for grain storage. UV stabilized and tear resistant.',
    image: 'https://5.imimg.com/data5/SELLER/Default/2021/7/NY/UL/GL/1288586/hdpe-woven-sack-500x500.jpg',
    price: 80,
    stock: 100,
    usage: 'Use for storing grains, seeds, or fertilizers.',
    cropType: ['Paddy', 'Wheat', 'Maize'],
    isBestSeller: false,
    isNewArrival: false,
    dosage: '',
    unit: 'piece'
  },
  // Combo Pack Example
  {
    name: 'Tomato Farming Kit',
    brand: 'AgroCombo',
    category: 'Combo',
    subCategory: 'Kit',
    type: 'Bundle',
    description: 'All-in-one kit for tomato farming: hybrid seeds, urea fertilizer, neem oil, and sprayer.',
    image: 'https://www.ugaoo.com/cdn/shop/products/Tomato-Farming-Kit.jpg',
    price: 1500,
    stock: 20,
    usage: 'Follow included instructions for best results.',
    cropType: ['Tomato'],
    isBestSeller: true,
    isNewArrival: true,
    dosage: 'See kit manual',
    unit: 'kit',
    bundle: [] // You can update this after seeding to reference product IDs
  },
  // More seeds
  { name: 'Brinjal F1 Hybrid', brand: 'Mahyco', category: 'Seeds', subCategory: 'Vegetables', type: 'Hybrid', description: 'F1 hybrid brinjal seed.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/9/KO/OC/DQ/1437398/mahyco-f-1-hybrid-brinjal-seeds-500x500.jpg', price: 110, stock: 70, usage: 'For Brinjal', cropType: ['Brinjal'], isBestSeller: false, isNewArrival: false, dosage: '60g/acre', unit: 'pack' },
  { name: 'Green Gram Seed', brand: 'JK Agri Genetics', category: 'Seeds', subCategory: 'Pulses', type: 'Certified', description: 'High-quality green gram seed.', image: 'https://5.imimg.com/data5/SELLER/Default/2023/2/SU/YT/VA/4348685/green-gram-seed.jpg', price: 95, stock: 90, usage: 'For Green gram', cropType: ['Green gram'], isBestSeller: false, isNewArrival: false, dosage: '15kg/acre', unit: 'bag' },
  // Fertilizers
  { name: 'DAP Fertilizer (18-46-0)', brand: 'Nagarjuna', category: 'Fertilizers', subCategory: 'Macronutrients', type: 'Granular', description: 'Phosphorus and nitrogen fertilizer.', image: 'https://5.imimg.com/data5/ANDROID/Default/2022/11/BX/MS/OJ/14352136/product-jpeg-500x500.jpg', price: 1200, stock: 150, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '50kg/acre', unit: 'bag' },
  { name: 'Zinc Sulphate Monohydrate 21%', brand: 'Coromandel', category: 'Fertilizers', subCategory: 'Micronutrients', type: 'Micronutrient', description: 'Zinc supplement for crops.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/1/NU/FX/PF/12068910/zinc-sulphate-21-500x500.jpg', price: 450, stock: 80, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: true, dosage: '10kg/acre', unit: 'bag' },
  { name: 'Boron Micronutrient', brand: 'Yara', category: 'Fertilizers', subCategory: 'Micronutrients', type: 'Micronutrient', description: 'Boron for fruit setting.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/3/UW/FL/BV/148494918/boron-20-fertilizer-500x500.jpg', price: 500, stock: 40, usage: 'For fruits', cropType: ['Tomato', 'Brinjal'], isBestSeller: false, isNewArrival: false, dosage: '2kg/acre', unit: 'bag' },
  // More fertilizers
  { name: 'Compost Cow Dung', brand: 'Organic India', category: 'Fertilizers', subCategory: 'Compost & Manure', type: 'Compost', description: 'Organic cow dung compost.', image: 'https://www.ugaoo.com/cdn/shop/products/Cow-Dung-Manure-1.jpg', price: 250, stock: 40, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: true, dosage: '100kg/acre', unit: 'bag' },
  { name: 'Sunflower Oil Cake', brand: 'Godrej Agrovet', category: 'Fertilizers', subCategory: 'Biofertilizers', type: 'Organic', description: 'Organic oil cake for soil enrichment.', image: 'https://5.imimg.com/data5/SELLER/Default/2023/5/308336334/FB/GY/RT/190035655/sunflower-oil-cake-500x500.jpg', price: 220, stock: 30, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '50kg/acre', unit: 'bag' },
  { name: 'Neem Cake', brand: 'Parry', category: 'Fertilizers', subCategory: 'Biofertilizers', type: 'Organic', description: 'Neem cake for pest and soil health.', image: 'https://m.media-amazon.com/images/I/71mBq128-FL._AC_UF1000,1000_QL80_.jpg', price: 320, stock: 25, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '100kg/acre', unit: 'bag' },
  // Pesticides
  { name: 'Ridomil Gold', brand: 'Syngenta', category: 'Pesticides', subCategory: 'Fungicides', type: 'Fungicide', description: 'Fungicide for blight.', image: 'https://content.syngenta.com/products/images/png/11386-1.png', price: 800, stock: 30, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '250g/acre', unit: 'pack' },
  { name: 'Glyphosate Herbicide', brand: 'Rallis India', category: 'Pesticides', subCategory: 'Herbicides', type: 'Herbicide', description: 'Weed control herbicide.', image: 'https://5.imimg.com/data5/ANDROID/Default/2022/9/KW/AF/XQ/17799515/product-jpeg-500x500.jpg', price: 400, stock: 40, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '1L/acre', unit: 'bottle' },
  // More pesticides
  { name: 'Trichoderma Biofungicide', brand: 'T Stanes', category: 'Pesticides', subCategory: 'Bio-pesticides', type: 'Biofungicide', description: 'Biological control of soil-borne diseases.', image: 'https://cdn.shopify.com/s/files/1/0722/2059/products/t-stanes-bio-cure-f-trichoderma-viride-1-wp-250-gm-t-stanes-1.jpg', price: 300, stock: 30, usage: 'For all crops', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '1kg/acre', unit: 'pack' },
  // Tools & Equipment
  { name: 'Battery Sprayer – 12V/8Ah', brand: 'Neptune', category: 'Tools', subCategory: 'Sprayers', type: 'Electric', description: 'Battery-operated sprayer.', image: 'https://images-cdn.ubuy.co.in/634ef5bd5335ba3e47335e29-neptune-nf-555-12v-8ah-battery.jpg', price: 2500, stock: 15, usage: 'For spraying', cropType: [], isBestSeller: false, isNewArrival: true, dosage: '', unit: 'piece' },
  { name: 'Watering Can (5L)', brand: 'Generic', category: 'Tools', subCategory: 'Watering', type: 'Can', description: '5-liter watering can for gardens.', image: 'https://www.ugaoo.com/cdn/shop/products/Watering-Can-5-Litre.jpg', price: 300, stock: 30, usage: 'For watering plants', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'piece' },
  // Tools
  { name: 'Garden Trowel', brand: 'Falcon', category: 'Tools', subCategory: 'Hand Tools', type: 'Trowel', description: 'Durable garden trowel for planting.', image: 'https://m.media-amazon.com/images/I/61b513M9S2L.jpg', price: 150, stock: 50, usage: 'For planting seedlings', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'piece' },
  { name: 'Pruning Shears', brand: 'Wolf-Garten', category: 'Tools', subCategory: 'Hand Tools', type: 'Shears', description: 'Sharp pruning shears for trimming.', image: 'https://target.scene7.com/is/image/Target/GUEST_701548e6-993a-441f-8e4d-375945197b1a', price: 400, stock: 40, usage: 'For pruning plants', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'piece' },
  { name: 'Soil pH Testing Kit', brand: 'Generic', category: 'Tools', subCategory: 'Testing Kits', type: 'Manual', description: 'Test soil pH easily.', image: 'https://m.media-amazon.com/images/I/7190z9YmGfL.jpg', price: 600, stock: 20, usage: 'For soil testing', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'kit' },
  { name: 'Drip Irrigation Kit (100 m²)', brand: 'KSNM', category: 'Tools', subCategory: 'Irrigation', type: 'Basic Kit', description: 'Drip irrigation for small farms.', image: 'https://m.media-amazon.com/images/I/81+j-d1y4+L._AC_UF1000,1000_QL80_.jpg', price: 1800, stock: 10, usage: 'For irrigation', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'kit' },
  // Protective Gear
  { name: 'PVC Long Gloves', brand: 'Trust Leaf', category: 'Protective Gear', subCategory: 'Gloves', type: 'Chemical-resistant', description: 'Long gloves for chemical handling.', image: 'https://m.media-amazon.com/images/I/51pLscG+oVL._AC_UL400_.jpg', price: 250, stock: 40, usage: 'For protection', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'pair' },
  { name: 'Agricultural Gum Boots', brand: 'Karam', category: 'Protective Gear', subCategory: 'Boots', type: 'PVC', description: 'Water-resistant gum boots.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/1/DB/VN/ED/7382436/safety-gum-boots-500x500.jpg', price: 700, stock: 20, usage: 'For protection', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'pair' },
  // Packaging Items
  { name: 'Plastic Crate 25L', brand: 'Supreme', category: 'Packaging', subCategory: 'Crates', type: 'Plastic', description: '25L crate for fruits/vegetables.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/10/GA/DA/WY/1879558/supreme-plastic-crates-500x500.jpg', price: 350, stock: 50, usage: 'For transport', cropType: [], isBestSeller: false, isNewArrival: false, dosage: '', unit: 'piece' },
  { name: 'UV Stabilized Tarpaulin Sheet', brand: 'Silpaulin', category: 'Packaging', subCategory: 'Sheets/Tarps', type: 'UV Stabilized', description: 'Sheet for drying/protection.', image: 'https://rukminim2.flixcart.com/image/850/1000/l3dcl8w0/tarpaulin/v/e/d/15-1-12-gsm-120-silpaulin-original-imageggrtkyzjnfw.jpeg?q=20&crop=false', price: 900, stock: 30, usage: 'For drying', cropType: [], isBestSeller: false, isNewArrival: true, dosage: '', unit: 'sheet' },
  // Additional demo products
  { name: 'Black Gram Seed', brand: 'Nuziveedu Seeds', category: 'Seeds', subCategory: 'Pulses', type: 'Certified', description: 'Certified black gram seed.', image: 'https://5.imimg.com/data5/ANDROID/Default/2023/8/335893695/XO/WE/JU/42259648/product-jpeg-500x500.jpg', price: 100, stock: 70, usage: 'For Black gram', cropType: ['Black gram'], isBestSeller: false, isNewArrival: false, dosage: '15kg/acre', unit: 'bag' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Product.deleteMany({});
    console.log('Existing products cleared.');

    await Product.insertMany(demoProducts);
    console.log(`${demoProducts.length} products have been seeded.`);

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();