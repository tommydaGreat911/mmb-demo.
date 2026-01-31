const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const dayjs = require('dayjs');

const DATA_DIR = path.join(__dirname, 'data');
const SHOPS_FILE = path.join(DATA_DIR, 'shops.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(SHOPS_FILE)) fs.copyFileSync(path.join(__dirname,'data','shops.json'), SHOPS_FILE);
if (!fs.existsSync(BOOKINGS_FILE)) fs.writeJsonSync(BOOKINGS_FILE, []);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Helpers
function readShops(){ return fs.readJsonSync(SHOPS_FILE); }
function writeShops(s){ fs.writeJsonSync(SHOPS_FILE, s, {spaces:2}); }
function readBookings(){ return fs.readJsonSync(BOOKINGS_FILE); }
function writeBookings(b){ fs.writeJsonSync(BOOKINGS_FILE, b, {spaces:2}); }

// API: get shops
app.get('/api/shops', (req,res)=>{
  res.json(readShops());
});

// API: get single shop
app.get('/api/shops/:id', (req,res)=>{
  const shops = readShops();
  const shop = shops.find(s=>s.id===req.params.id);
  if(!shop) return res.status(404).json({error:'not found'});
  res.json(shop);
});

// API: create booking
app.post('/api/bookings', (req,res)=>{
  const { shopId, name, phone, bookingTime, serviceId } = req.body;
  if(!shopId || !name || !phone || !bookingTime || !serviceId) return res.status(400).json({error:'missing fields'});
  const shops = readShops();
  const shop = shops.find(s=>s.id===shopId);
  if(!shop) return res.status(400).json({error:'invalid shop'});
  const service = (shop.services||[]).find(x=>x.id===serviceId);
  if(!service) return res.status(400).json({error:'invalid service'});

  const bookings = readBookings();
  const id = 'b_' + Date.now();
  const createdAt = new Date().toISOString();
  const autoConfirmed = !!shop.autoConfirm;
  const booking = { id, shopId, name, phone, bookingTime, serviceId, serviceName:service.name, status: autoConfirmed ? 'confirmed' : 'pending', createdAt };
  bookings.push(booking);
  writeBookings(bookings);

  // If owner-approval required, include owner notification payload in response for demo
  res.json({ok:true, booking});
});

// API: owner login (demo)
app.post('/api/owner/login', (req,res)=>{
  const { email, password } = req.body;
  if(email==='owner@demo.com' && password==='DemoPass123') return res.json({ok:true, token:'demo-owner-token'});
  res.status(401).json({error:'invalid credentials'});
});

// API: owner bookings (requires token header demo)
app.get('/api/owner/bookings', (req,res)=>{
  const token = req.headers['x-owner-token'];
  if(token!=='demo-owner-token') return res.status(401).json({error:'unauthorized'});
  const bookings = readBookings();
  res.json(bookings);
});

// API: toggle autoConfirm per shop
app.post('/api/owner/shop/:id/toggle', (req,res)=>{
  const token = req.headers['x-owner-token'];
  if(token!=='demo-owner-token') return res.status(401).json({error:'unauthorized'});
  const shops = readShops();
  const shop = shops.find(s=>s.id===req.params.id);
  if(!shop) return res.status(404).json({error:'not found'});
  shop.autoConfirm = !shop.autoConfirm;
  writeShops(shops);
  res.json({ok:true, shop});
});

// API: health
app.get('/api/health', (req,res)=>res.json({ok:true}));

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('MMB demo server running on', port));
