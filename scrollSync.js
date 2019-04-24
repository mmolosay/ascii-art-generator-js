function scrollSync() {
    var res = document.getElementById('result-block');
    var src = document.getElementById('source-block');

    src.onscroll = () => {
        res.scrollTop = src.scrollTop;
        res.scrollLeft = src.scrollLeft;
    };
    res.onscroll = () => {
        src.scrollTop = res.scrollTop;
        src.scrollLeft = res.scrollLeft;
    };
}
