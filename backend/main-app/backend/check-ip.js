import https from 'https';

console.log('🌐 Checking Your Current IP Address...\n');

// Check public IP using multiple services
const services = [
  {
    name: 'ipify',
    url: 'https://api.ipify.org?format=json',
    parse: (data) => JSON.parse(data).ip
  },
  {
    name: 'ipapi',
    url: 'https://ipapi.co/json/',
    parse: (data) => {
      const parsed = JSON.parse(data);
      return {
        ip: parsed.ip,
        city: parsed.city,
        region: parsed.region,
        country: parsed.country_name,
        isp: parsed.org
      };
    }
  }
];

async function getIP(service) {
  return new Promise((resolve, reject) => {
    https.get(service.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(service.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkIP() {
  try {
    // Get basic IP
    const ip = await getIP(services[0]);
    console.log('✅ Your Current IP Address:', ip);
    console.log('\n📋 Steps to Add This IP to MongoDB Atlas:\n');
    console.log('1. Go to: https://cloud.mongodb.com');
    console.log('2. Click on "Network Access" in the left sidebar');
    console.log('3. Click "Add IP Address" button');
    console.log('4. Enter this IP address:', ip);
    console.log('5. Or click "Add Current IP Address" (should auto-detect)\n');
    
    // Get detailed info
    try {
      const details = await getIP(services[1]);
      console.log('📍 Your Location Details:');
      console.log('   IP:', details.ip);
      console.log('   City:', details.city);
      console.log('   Region:', details.region);
      console.log('   Country:', details.country);
      console.log('   ISP:', details.isp);
    } catch (e) {
      // Detailed info is optional
    }
    
    console.log('\n💡 Alternative: Allow from Anywhere (Development Only)');
    console.log('   Add IP: 0.0.0.0/0 (allows all IPs - use only for testing!)\n');
    
    console.log('⏱️  After adding your IP, wait 1-2 minutes then run:');
    console.log('   node test-mongodb.js\n');
    
  } catch (error) {
    console.error('❌ Error getting IP:', error.message);
    console.log('\n💡 You can manually check your IP at:');
    console.log('   https://whatismyipaddress.com/\n');
  }
}

checkIP();
