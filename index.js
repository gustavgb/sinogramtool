document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('input[name="file"]').onchange = handleUpload;
})

function requestLoad() {
  document.getElementById('wait').style.display = 'block';
  document.getElementById('sinogram').style.display = 'none';
}

function doneLoad() {
  document.getElementById('wait').style.display = 'none';
  document.getElementById('sinogram').style.display = 'block';
}

function handleUpload(evt) {
  const files = document.getElementById('file').files;
  
  const l = [];

  for (let i = 0; i < files.length; i++) {
    l.push(getProfileFromFile(files[i]));
  }

  requestLoad();

  setTimeout(function () {
    Promise.all(l).then(values => {
      console.log(values);

      const canvas = document.getElementById('can');
      const ctx = canvas.getContext('2d');

      const width = values[0].width;
      canvas.width = width;
      canvas.height = width;

      const h = width / values.length;

      values.forEach((projection, y) => {
        const data = projection.data;
        for (let i = 0; i < data.length; i += 4) {
          const x = i / 4;

          ctx.fillStyle = `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, 1)`;
          ctx.fillRect(x, y * h, 2, h+1);
        }
      });
    }).then(() => doneLoad());
  }, 1);
}

function getProfileFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = function () {
      const img = new Image();
      img.onload = function () {
        const profile = getProfileAt(img, 240);

        resolve({width: img.width, data: profile});
      }

      img.src = reader.result;
    }

    reader.onerror = function (e) {
      reject(e);
    }

    reader.readAsDataURL(file);
  });
}

function getProfileAt(img, position) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const beginIndex = position * (img.width * 4);
  const endIndex = (position + 1) * (img.width * 4);

  const slice = [].slice.call(imgData.data, beginIndex, endIndex);

  return slice;
}