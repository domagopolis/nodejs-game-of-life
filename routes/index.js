var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {

	var colours = ['red', 'green', 'blue', 'orange', 'purple', 'white', 'black', 'pink', 'indigo', 'silver'];
	var colour = colours[Math.floor(Math.random()*colours.length)];
	var features = ['plateau', 'plains', 'coast', 'valley', 'canyon', 'escarpment', 'forrest', 'springs', 'moors', 'peninsula'];
	var feature = features[Math.floor(Math.random()*features.length)];
	var number = Math.floor(Math.random()*90000) + 10000;
	
	res.render('index', { "world" : false, "slug" : colour+'-'+feature+'-'+number, "randomName" : colour+' '+feature });
});

router.get('/world/:slug', function(req, res) {
	var MongoClient = mongodb.MongoClient;

	var url = 'mongodb://localhost:27017/gameoflife';

	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server', err);
		}else{
			console.log('Connection Established');

			var collection = db.collection('worlds');

			var slug = req.params.slug;

			collection.findOne({'slug' : slug}, function(err, result){
				if(err){
					res.send(err);
				}else if(result){
					res.render('index', { 'world' : result });
					/*var interval = setInterval(function(){
						for ( var x in result.plots ){
							for ( var y in result.plots[x] ){
								if( result.plots[x][y].lifeform ){
									if( result.plots[x][y].lifeform.sex === 'M' ){
										;
									}
									result.plots[x][y].lifeform.age++;
									console.log(result.plots[x][y].x+', '+result.plots[x][y].y);
									console.log(result.plots[x][y].lifeform.sex, result.plots[x][y].lifeform.age);
								}
							}
						}
					}, 1000 );*/
				}else{
					res.send('No documents found');
				}

				db.close();
			});
		}
	});
})

router.post('/createworld', function(req, res){
	var MongoClient = mongodb.MongoClient;

	var url = 'mongodb://localhost:27017/gameoflife';
	MongoClient.connect(url, function(err, db){
		if(err){
			console.log('Unable to connect to server', err);
		}else{
			console.log('Connection Established');

			var collection = db.collection('worlds');

			collection.drop();

			var world = { 
				slug: req.body.slug, 
				name: req.body.name, 
				food_rate: req.body.food_rate, 
				population_rate: req.body.population_rate, 
				life_expectency: req.body.life_expectency, 
				sex_rate: req.body.sex_rate, 
				conception_probality: req.body.conception_probality, 
				twin_conception_probality: req.body.twin_conception_probality, 
				triplet_conception_probality: req.body.triplet_conception_probality, 
				width: req.body.width, 
				height: req.body.height, 
				plots: [] };

			for(i = 0; i < world.height; i++){
				var row = [];
				for(j = 0; j < world.width; j++){
					var cell = {x: i, y: j };

					var food = !(Math.random()+1-req.body.food_rate|0);
					if( food ){
						cell['food'] = food;
					}else{
						var populate = !(Math.random()+1-req.body.population_rate|0);
						if( populate ){
							var lifeform = { age: Math.round( Math.random()*req.body.life_expectency ) };
							var male = !(Math.random()+1-req.body.sex_rate|0);
							if( male )
								lifeform['sex'] = 'M';
							else
								lifeform['sex'] = 'F';

							cell['lifeform'] = lifeform;
						}
					}

					row.push( cell );
				}
				world.plots.push(row);
			}

			collection.insert([world], function(err, result){
				if(err){
					console.log(err);
				}
			});

			db.close();

			res.redirect("/world/"+req.body.slug);
		}
	});
});

module.exports = router;
