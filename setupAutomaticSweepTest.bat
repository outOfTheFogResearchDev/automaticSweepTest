git clone https://github.com/outOfTheFogResearchDev/automaticSweepTest
cd automaticSweepTest
mkdir config
echo exports.SECRET = `${Math.random()}`; > config/config.js
npm run setup