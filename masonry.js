var elem = document.querySelector('.grid');
var msnry = new Masonry(elem, {
   // options
   itemSelector: '.grid-item',
});

// element argument can be a selector string
//   for an individual element
var msnry = new Masonry('.grid', {
   // options
});