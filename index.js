const Twit = require('twit');
const axios = require('axios');
const fs = require('fs');

// Add your owns
const T = new Twit({
  consumer_key: CUSTOMER_KEY,
  consumer_secret: SECRET_KEY,
  access_token: ACCESS_TOKEN,
  access_token_secret: ACCESS_SECRET,
});

const config = {
  headers: {Authorization: `Bearer search-i68fdztxaah5fnnnwhonpkyz`},
};

old_products = [];
new_products = [];
products = [];
size = 1000;
page = 1;

setInterval(function(){
  getPreviousProducts(function() {
    let latest = files.sort()[files.sort().length - 1];
    let rawdata = fs.readFileSync(latest);
    let products = JSON.parse(rawdata);
    console.log(latest);

    products.forEach(function(product) {
      old_products.push(product);
    });
  });
  getProducts();
}, 1000 * 60 * 60);

exclude = [
  '.idea',
  'index.js',
  'node_modules',
  'package-lock.json',
  'package.json'];

files = [];

function getPreviousProducts(callback) {
  let that = this;
  fs.readdir(__dirname, function(err, files) {
    files.sort().forEach(function(file) {
      if (!that.exclude.includes(file)) {
        that.files.push(file);
      }
    });

    callback();
  });
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getProducts() {
  console.log('running');
  sleep(1000).then(() => {
    axios.post('https://host-3ot9u2.api.swiftype.com/api/as/v1/engines/lpb-app-prod/search', {
      'query': ' ',
      'page': {
        'size': size, 'current': page,
      },
      'facets': {
        'region': [{'type': 'value', 'size': 100}],
        'place_type': [{'type': 'value', 'size': 10}],
      },
    }, config).then(function(response) {
      console.log(response);
      products.push(response.data.results);

      if (response.data.meta.page.total_pages > page) {
        page++;
        getProducts();
      } else {
        products.forEach(function(productList) {
          productList.forEach(function(product) {
            new_products.push(product);
          });
        });
        checkForNew();
        fs.writeFile(new Date().getTime() + '.txt', JSON.stringify(new_products), 'utf-8', function() {
          console.log('saved');
        });
      }
    }).catch(function(error) {
      console.log(error);
    });
  });
}

news = [];

function checkForNew() {
  new_products.forEach(function(n_product) {
    let inside = false;
    old_products.forEach(function(o_product) {
      if (o_product.name.raw === n_product.name.raw) {
        inside = true;
      }
    });

    if (!inside) {
      news.push(n_product);
    }
  });

  console.log('NEWSS!');
  console.log(news);
  console.log('END!!!');

  tweet();
}

function tweet(){
  if(news.length > 0) {
    news.forEach(function(n_p) {
      sleep(1000).then(() => {
        let config = {
          status: '#panierbleu NOUVEAU COMMERCE: ' + news.name.raw
        };

        T.post('statuses/update', config, function() {
          console.log('tweeted');
        })
      });
    });
  } else {
    let config = {
      status: '#panierbleu AUCUN NOUVEAU COMMERCE. (Mise à jour à toutes les heures)'
    };

    T.post('statuses/update', config, function() {
      console.log('tweeted');
    })
  }
}
