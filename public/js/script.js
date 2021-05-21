document.addEventListener('DOMContentLoaded', function() {
  const elems = document.querySelectorAll('.collapsible');
  const options = {
    accordion: true
  }
  const instances = M.Collapsible.init(elems, options);
  console.log('done')
});