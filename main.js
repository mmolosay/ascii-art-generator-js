var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var autoBgCheckbox = document.querySelector('.auto-bg input');

document.querySelector('.preview-block').style.display = 'none';

var reverseColor = () => {
    let bgcolor = document.querySelector('.color-pick input');
    let colorRGB = {
        r: parseInt(bgcolor.value.substr(1, 2), 16),
        g: parseInt(bgcolor.value.substr(3, 2), 16),
        b: parseInt(bgcolor.value.substr(5, 2), 16)
    };
    let newColorHEX = ['#', (255 - colorRGB.r).toString(16), (255 - colorRGB.g).toString(16), (255 - colorRGB.b).toString(16)];

    newColorHEX.forEach((item, i, arr) => {
        if (i) {
            if (arr[i].toString(10) < 17) arr[i] += arr[i];
        };
    });

    bgcolor.value = newColorHEX.join('');
};

function autoBgWarn() {
    if (autoBgCheckbox.checked) {
        autoBgCheckbox.nextElementSibling.nextElementSibling.innerText = '\'Bg color\' will be ignored.';
    } else {
        autoBgCheckbox.nextElementSibling.nextElementSibling.innerText = '';
    }
}

function createArt() {
    var readImage = new Promise((resolve, reject) => {
        var fileData = 'a';
        // Записывает содержимое файла в виде строки в переменную fileData.
        var loadFile = (file) => {
            var reader = new FileReader();
            reader.onload = (data) => {
                fileData = data.target.result;
            }
            reader.readAsDataURL(file);
        };

        var loadFromField = () => {
            loadFile(document.getElementById('upload').files[0]);
            setTimeout(() => {
                if (fileData !== null) resolve(fileData);
                else reject();
            }, 500);
        };

        loadFromField();
    });

    readImage
        .then(
            (urlData) => {
                document.querySelector('.preview-block').removeAttribute('style');
                canvas.style.display = 'block';

                var sourceImg = document.getElementById('img-source');
                var pasteUrlData = new Promise((resolve, reject) => {
                    sourceImg.src = urlData;
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });

                pasteUrlData
                    .then(
                        () => {
                            canvas.width = sourceImg.width;
                            canvas.height = sourceImg.height;
                            ctx.drawImage(sourceImg, 0, 0);

                            setTimeout(() => {
                                return;
                            }, 500)
                        })

                    .then(
                        () => {
                            sourceData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                            return sourceData;
                        })

                    .then(
                        (sourceData) => {
                            var grid = [];

                            for (let i = 0; i < canvas.height; i += 1) {
                                grid[i] = [];
                                for (let j = 0; j < canvas.width * 4; j += 4) {
                                    grid[i][j / 4] = {};
                                    grid[i][j / 4].r = sourceData[i * canvas.width * 4 + j + 0];
                                    grid[i][j / 4].g = sourceData[i * canvas.width * 4 + j + 1];
                                    grid[i][j / 4].b = sourceData[i * canvas.width * 4 + j + 2];
                                }
                            }

                            return (grid);
                        })

                    .then(
                        (grid) => {
                            var fontSize = +document.querySelector('.text-size input').value;
                            var symbolList = document.querySelector('.text-list input').value;
                            var bgc = document.querySelector('.color-pick input').value;
                            var autoBg = autoBgCheckbox.checked;
                            var autoColor = {
                                r: 0,
                                g: 0,
                                b: 0
                            };

                            var sH = fontSize - Math.floor(fontSize * 0.2);
                            var sW = Math.floor(sH * 0.6);

                            var colorsCollect = [];

                            for (let i = 0; i < Math.floor(grid.length / sH); i++) {
                                if (colorsCollect[i] === undefined) colorsCollect[i] = [];
                                for (let j = 0; j < Math.floor(grid[i].length / sW); j++) {
                                    colorsCollect[i][j] = {};
                                    colorsCollect[i][j].r = 0;
                                    colorsCollect[i][j].g = 0;
                                    colorsCollect[i][j].b = 0;
                                }
                            }

                            for (let i = 0; i < grid.length; i++) {
                                for (let j = 0; j < grid[0].length; j++) {
                                    if (Math.floor(i / sH) >= colorsCollect.length || Math.floor(j / sW) >= colorsCollect[0].length) break;

                                    colorsCollect[Math.floor(i / sH)][Math.floor(j / sW)].r += grid[i][j].r;
                                    colorsCollect[Math.floor(i / sH)][Math.floor(j / sW)].g += grid[i][j].g;
                                    colorsCollect[Math.floor(i / sH)][Math.floor(j / sW)].b += grid[i][j].b;
                                }
                            }

                            for (let i = 0; i < colorsCollect.length; i++) {
                                for (let j = 0; j < colorsCollect[0].length; j++) {
                                    colorsCollect[i][j].r = Math.floor(colorsCollect[i][j].r / (sW * sH));
                                    colorsCollect[i][j].g = Math.floor(colorsCollect[i][j].g / (sW * sH));
                                    colorsCollect[i][j].b = Math.floor(colorsCollect[i][j].b / (sW * sH));
                                }
                            }

                            if (autoBg) {
                                for (let i = 0; i < colorsCollect.length; i++) {
                                    for (let j = 0; j < colorsCollect[0].length; j++) {
                                        autoColor.r += colorsCollect[i][j].r;
                                        autoColor.g += colorsCollect[i][j].g;
                                        autoColor.b += colorsCollect[i][j].b;
                                    }
                                }

                                autoColor.r = Math.floor(autoColor.r / (colorsCollect.length * colorsCollect[0].length));
                                autoColor.g = Math.floor(autoColor.g / (colorsCollect.length * colorsCollect[0].length));
                                autoColor.b = Math.floor(autoColor.b / (colorsCollect.length * colorsCollect[0].length));

                                autoColor.r = Math.floor(autoColor.r * 0.6);
                                autoColor.g = Math.floor(autoColor.g * 0.6);
                                autoColor.b = Math.floor(autoColor.b * 0.6);
                            }

                            for (let i = 0; i < colorsCollect.length; i++) {
                                for (let j = 0; j < colorsCollect[0].length; j++) {
                                    colorsCollect[i][j].x = j * sW;
                                    colorsCollect[i][j].y = i * sH;
                                }
                            }

                            var getSymbolFromList = () => {
                                if (typeof symbolList !== 'array') symbolList.split('');
                                return (symbolList[Math.floor(Math.random() * symbolList.length)])
                            };

                            var getResultData = (collect) => {
                                if (autoBg) ctx.fillStyle = 'rgb(' + autoColor.r + ', ' + autoColor.g + ', ' + autoColor.b + ')';
                                else ctx.fillStyle = bgc;

                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.font = fontSize + "px Monospace";

                                for (let i = 0; i < collect.length; i++) {
                                    for (let j = 0; j < collect[0].length; j++) {
                                        let symb = collect[i][j];
                                        ctx.fillStyle = 'rgb(' + symb.r + ', ' + symb.g + ', ' + symb.b + ')';
                                        ctx.fillText(getSymbolFromList(), symb.x, symb.y);
                                    }
                                }
                                return (canvas.toDataURL());
                            };

                            canvas.style.display = 'none';
                            document.getElementById("result-image").src = getResultData(colorsCollect);

                            setTimeout(() => {
                                scrollSync(); //in another file
                            }, 100);
                        })
            });
}
