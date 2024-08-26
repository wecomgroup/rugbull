const initRoutes=require('../../libary/initRoutes');
const games=require('../frontend/games');
const index=require('../frontend/index');
const users=require('../frontend/users');
const magicCard=require('../frontend/magicCard');
const telegram=require('../frontend/telegram');


module.exports=initRoutes([
    games,
    index,
    users,
    magicCard,
    telegram
])