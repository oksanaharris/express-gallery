const metaFieldsUl = document.getElementById('metaFieldsList');
const addMetaFieldsBtn = document.getElementById('addMetaFieldsBtn');

console.log('this is our ul', metaFieldsUl);

console.log('this is our button', addMetaFieldsBtn);

addMetaFieldsBtn.addEventListener('click', (e) => {
  let metaFieldsLi = document.createElement('li');

  let meta_key = document.createElement('input');
  meta_key.type = 'text';
  meta_key.placeholder = 'Attribute';

  meta_key.addEventListener('change', (e) => {
    meta_value.name = `meta[${e.target.value}]`;
  });

  let meta_value = document.createElement('input');
  meta_value.type = 'text';
  meta_value.placeholder = 'Value';

  metaFieldsLi.appendChild(meta_key);
  metaFieldsLi.appendChild(meta_value);

  metaFieldsUl.appendChild(metaFieldsLi);
});



