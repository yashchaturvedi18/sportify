const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController')
const { isLoggedIn, isHost, isValidTrade} = require('../middlewares/auth');
const { validateId, validateProduct, validateResult } = require('../middlewares/validator'); 

router.get('/',controller.index)

router.get('/new',isLoggedIn,controller.new)

router.post('/', isLoggedIn, validateProduct, validateResult,controller.create)

router.get('/:id', validateId,controller.show)


router.get('/:id/edit',validateId, isLoggedIn, isHost,controller.edit)


router.put('/:id',validateId, isLoggedIn, isHost,controller.update)


router.delete('/:id',validateId, isLoggedIn, isHost,controller.delete)

//new trade
router.get('/newTrade/:tradeWith', isLoggedIn, controller.newTrade)

//new trade update
router.post('/newTrade/:tradeWith/', isLoggedIn, controller.newTradeUpdate)

//manage 
router.get('/manage/offer/:tradeItem/:tradeWith/', isLoggedIn, isValidTrade, controller.manageOffer)

//cancel
router.post('/cancel/offer/:tradeItem/:tradeWith', isLoggedIn, isValidTrade, controller.cancelOffer)

//accept
router.post('/accept/offer/:tradeItem/:tradeWith', isLoggedIn, isValidTrade, controller.acceptOffer)

//add or remove from watchlist
router.post('/watchlist/:id/', isLoggedIn, controller.watchlistOperation)

module.exports = router;