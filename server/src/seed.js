import 'dotenv/config'; import mongoose from 'mongoose'; import bcrypt from 'bcryptjs'; import slugify from 'slugify';
import User from './models/User.js'; import Category from './models/Category.js'; import Ebook from './models/Ebook.js';
const run=async()=>{await mongoose.connect(process.env.MONGO_URI);console.log('Connected to MongoDB');const pw=await bcrypt.hash('admin123',10);const creator=await User.findOneAndUpdate({username:'admin'},{name:'Admin',username:'admin',email:'admin@onbook.local',password:pw,role:'creator'},{upsert:true,new:true});const names=['Art & Crafts','Biography','Business & Development',"Children's Books",'Fiction & Fantasy','Comics'];const cats={};for(const name of names){const c=await Category.findOneAndUpdate({name},{name,slug:slugify(name,{lower:true})},{upsert:true,new:true});cats[name]=c;}
const books=[['Thus Spoke Zarathustra','Friedrich Nietzsche','/assets/img/core/1.jpeg',32,'Fiction & Fantasy'],['Confession of a Mask','Yukio Mishima','/assets/img/core/2.jpeg',28,'Biography'],['The Rebel','Albert Camus','/assets/img/core/3.jpg',18,'Fiction & Fantasy'],['1984','George Orwell','/assets/img/core/4.jpg',36,'Fiction & Fantasy']];
for(const [title,author,cover,price,cat] of books){const slug=slugify(title,{lower:true});await Ebook.findOneAndUpdate({slug},{title,slug,author:creator,description:`A featured On.Book edition of ${title} by ${author}.`,coverImage:cover,price,isPaid:true,rating:4.5,reviewCount:0,category:cats[cat],keywords:`${author}, classic, ${cat}`,publisher:author,status:'available',file:'/uploads/books/example.pdf'},{upsert:true,new:true});}
await Ebook.findOneAndUpdate({slug:'the-stranger'},{title:'The Stranger',slug:'the-stranger',author:creator,description:'A classic featured on the On.Book landing page.',coverImage:'/assets/img/core/stranger.png',price:0,isPaid:false,rating:4.5,category:cats['Fiction & Fantasy'],keywords:'Albert Camus, classic',publisher:'Albert Camus',status:'available',file:'/uploads/books/example.pdf'},{upsert:true,new:true});
const searchBooks=[
['Of White and Shady','Peter Venkman','/assets/img/search/1.png',15,'Biography'],
['Of White and Shady','Edmund de Waal','/assets/img/search/6.png',15,'Biography'],
['The Reading Room','Peter Venkman','/assets/img/search/7.png',15,'Fiction & Fantasy'],
['The Art of Making','Peter Venkman','/assets/img/search/2.png',15,'Art & Crafts'],
['Modern Stories','Peter Venkman','/assets/img/search/3.png',15,'Fiction & Fantasy'],
['Creative Minds','Peter Venkman','/assets/img/search/4.png',15,'Business & Development'],
['The Collector','Peter Venkman','/assets/img/search/5.png',15,'Comics']
];
for(const [title,author,cover,price,cat] of searchBooks){const slug=slugify(title+'-'+author,{lower:true});await Ebook.findOneAndUpdate({slug},{title,slug,author:creator,description:`A sample catalog title from the original On.Book search UI.`,coverImage:cover,price,isPaid:true,rating:4.5,reviewCount:0,category:cats[cat],keywords:`${author}, ${cat}`,publisher:author,status:'available',file:'/uploads/books/example.pdf'},{upsert:true,new:true});}
console.log('Seed complete. Login: admin / admin123');await mongoose.disconnect();};run().catch(e=>{console.error(e);process.exit(1);});
