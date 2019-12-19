// Load the http module to create an http server.
var http = require('http'); 

// Create a function to handle every HTTP request
function handler(req, res){

  var form = '';

  if(req.method == "GET"){ 
    
    form = '<!doctype html> \
<html lang="en"> \
<head> \
    <meta charset="UTF-8">  \
    <title>Form Calculator Add Example</title> \
</head> \
<body> \
  <form name="myForm" action="/" method="post">\
      <input type="text" name="A"> + \
      <input type="text" name="B"> = \
      <span id="result"></span> \
      <br> \
      <input type="submit" value="Submit"> \
  </form> \
</body> \
</html>';

  //respond
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(form);
  
  } else if(req.method == 'POST'){

    //read form data
    req.on('data', function(chunk) {

      //grab form data as string
      var formdata = chunk.toString();

      //grab A and B values
      var a = eval(formdata.split("&")[0]);
      var b = eval(formdata.split("&")[1])

      var result = calc(a,b);
        
      // cannot do this await run();
        
      console("client side");
      console.log(chunk.toString());
      console.log(a);
      console.log(b);
      console.log(result);

      //fill in the result and form values
    form = '<!doctype html> \
<html lang="en"> \
<head> \
    <meta charset="UTF-8">  \
    <title>Form Calculator Add Example</title> \
</head> \
<body> \
  <form name="myForm" action="/" method="post">\
      <input type="text" name="A" value="'+a+'"> + \
      <input type="text" name="B" value="'+b+'"> = \
      <span id="result">'+result+'</span> \
      <br> \
      <input type="submit" value="Submit"> \
  </form> \
</body> \
</html>';

    //respond
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(form);

    });

  } else {
    res.writeHead(200);
    res.end();
  };

};

//js functions running only in Node.JS
function calc(a,b){
  return  Number(a)+Number(b);;
}

async function run(){

    const csvUrl = 'dniris.csv';

    const trainingData = tf.data.csv(csvUrl, {
        columnConfigs: {
            species: {
                isLabel: true
            }
        }
    });        

    const numOfFeatures = (await trainingData.columnNames()).length - 1;

    // not sure?
    // is this one change the xs and ys
    // i.e. x is no of features
    // and the remainig is y i.e. one label columbs
    // ys only has one columns called ys.species and that will change into a labels array
    // ys becomes Object.values(labels) array like the xs which does not change
    // ??

    const numOfSamples = 150;
    const convertedData =
          trainingData.map(({xs,ys}) => {
              const labels = [
                  ys.species == "setosa" ? 1:0,
                  ys.species == "virginica" ? 1:0,
                  ys.species == "verisicolor" ? 1:0
              ]
              return{ xs: Object.values(xs), ys:Object.values(labels)};
          }).batch(10);


    const model = tf.sequential();

     model.add(tf.layers.dense({inputShape: [numOfFeatures], activation: "sigmoid", units: 5}))

    model.add(tf.layers.dense({
        activation: "softmax", units:3
        }));

    model.compile({
        loss:'categoricalCrossentropy',
        optimizer:tf.train.adam(0.06)
        });

    model.summary();

    await 
    model.fitDataset(convertedData, 
        { epochs: 100,
          callbacks:{
              onEpochEnd: async(epoch, logs) =>{
                  console.log("E: " 
                              + epoch 
                              + " Loss:" 
                              + logs.loss);

              }
          }
        });

// Test Cases:

// Setosa
// const testVal = tf.tensor2d([4.4, 2.9, 1.4, 0.2], [1, 4]); //row 10 4.4,2.9,1.4,0.2,setosa

// Virginica
// const testVal = tf.tensor2d([5.8,2.7,5.1,1.9], [1, 4]); // row 144 5.8,2.7,5.1,1.9,virginica

// Versicolor
// const testVal = tf.tensor2d([6.4, 3.2, 4.5, 1.5], [1, 4]); // row 53 6.4,3.2,4.5,1.5,versicolor

console.log("testVal is Setosa 4.4...")     

// Setosa
// const testVal = tf.tensor2d([4.4, 2.9, 1.4, 0.2], [1, 4]);

//const  <-- not using const to try do it two times 

const testVal100 = tf.tensor2d([4.4, 2.9, 1.4, 0.2], [1, 4]);

//const <-- not using const to try do it two times 

prediction = model.predict(testVal100)

alert(prediction); // 0.9x, 0.0x, 0.0x 



console.log("testVal is Virginica...");     

// Setosa

const testVal010 = tf.tensor2d([5.8, 2.7, 5.1, 1.9], [1, 4]);

prediction = model.predict(testVal010);

alert(prediction); // still 0 1 0 -- 0.0x, 0.9x, 0.0x? as below


console.log("testVal is Versicolor 6.4 ... should be last 1 BUT NOT ....")     

// Versicolor
// const testVal = tf.tensor2d([6.4, 3.2, 4.5, 1.5], [1, 4]);   

// constant cannot be reassinged !!! 

const testVal001a = tf.tensor2d([6.4, 3.2, 4.5, 1.5], [1, 4]) ;

prediction = model.predict(testVal001a)

alert(prediction); // strange 0 1 0 -- 0.0x, 0.0x, 0.9x? as below


// try row row 87 6,3.4,4.5,1.6,versicolor

console.log("testVal is Versicolor 6.4 ... should be last 1 BUT ALSO ALSO ALSO NOT ....")     


const testVal001b = tf.tensor2d([6.0, 3.4, 4.5, 1.6], [1, 4]);

prediction = model.predict(testVal001b)

alert(prediction); // not sure now ???

 // console.log("testVal is Virginica as last",      "testVal1 obj:\n",testVal1, "prediction obj:\n", prediction)
        // undefined testVal[1,1], 
        // undefined, prediction[0], 

// try row 95 5,2.3,3.3,1,versicolor

console.log("testVal is Versicolor row 95 5.2 ... should be last 1 BUT ALSO ALSO ALSO NOT ....")     


const testVal001c = tf.tensor2d([5.2, 2.3, 3.3, 3.1], [1, 4]);

prediction = model.predict(testVal001c)

alert(prediction); // not sure now ???

// return 12; // not sure need this ???

}

//        console.log(predictions);
//        for(i=0; i<7; i++){
//            if(predictions[i].results[0].match){
//                console.log(predictions[i].label + 
//                            " was found with probability of " + 
//                            predictions[i].results[0].probabilities[1]);                
  

// console.log("testVal is Virginica as last",      "testVal1 obj:\n",testVal1, "prediction obj:\n", prediction)
// undefined testVal[1,1], 
// undefined, prediction[0], 



// cannot do this:
// run();

// Create a server that invokes the `handler` function upon receiving a request
//http.createServer(handler).listen(8000, function(err){
// if(err){
//    console.log('Error starting http server');
//  } else {
//    console.log("Server running at http://127.0.0.1:8000/ or http://localhost:8000/");
//  };
//});

const express = require('express')
const app = express()
const port = 3000

// app.get('/', (req, res) => res.send('Hello World 3000!'))

app.get('/', (req, res) => {

  var form = '';

  if(req.method == "GET"){ 
    
    form = '<!doctype html> \
<html lang="en"> \
<head> \
    <meta charset="UTF-8">  \
    <title>Form Calculator Add Example</title> \
</head> \
<body> \
  <form name="myForm" action="/" method="post">\
      <input type="text" name="A"> + \
      <input type="text" name="B"> = \
      <span id="result"></span> \
      <br> \
      <input type="submit" value="Submit"> \
  </form> \
</body> \
</html>';

  //respond
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(form);
  
  }})

app.post('/', (req, res) => {

    //read form data
    req.on('data', function(chunk) {

      //grab form data as string
      var formdata = chunk.toString();

      //grab A and B values
      var a = eval(formdata.split("&")[0]);
      var b = eval(formdata.split("&")[1])

      var result = calc(a,b);

      // let runresult = await run; // assume function (); 
        // see https://medium.com/javascript-in-plain-english/async-await-javascript-5038668ec6eb
	  
      run();    
        
	  console.log("server side");
      console.log(chunk.toString());
      console.log(a);
      console.log(b);
      console.log(result);
      // console.log(runresult);

      //fill in the result and form values
    form = '<!doctype html> \
<html lang="en"> \
<head> \
    <meta charset="UTF-8">  \
    <title>Form Calculator Add Example</title> \
</head> \
<body> \
  <form name="myForm" action="/" method="post">\
      <input type="text" name="A" value="'+a+'"> + \
      <input type="text" name="B" value="'+b+'"> = \
      <span id="result">'+result+'</span> \
      <br> \
      <input type="submit" value="Submit"> \
  </form> \
</body> \
</html>';

    //respond
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(form);

    })})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
