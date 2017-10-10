const metaFieldsUl = document.getElementById('mainImageMeta');
const addMetaFieldsBtn = document.getElementById('addMetaFieldsBtn');

console.log('printing our meta data', window.initialMeta);

for (var key in window.initialMeta) {
  let liEl = document.createElement('li');

  let meta_key = document.createElement('input');
  meta_key.type = 'text';
  meta_key.value = key;

  let meta_value = document.createElement('input');
  meta_value.name = `meta[${meta_key.value}]`;
  meta_value.type = 'text';
  meta_value.value = window.initialMeta[key];

  meta_key.addEventListener('change', (e) => {
    meta_value.name = `meta[${e.target.value}]`;
  });

  liEl.appendChild(meta_key);
  liEl.appendChild(meta_value);

  metaFieldsUl.appendChild(liEl);

}

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
