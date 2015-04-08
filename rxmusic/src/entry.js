import keymovements from './keymovements'

keymovements(document).subscribe(function(x) {
  console.log(x)
})
