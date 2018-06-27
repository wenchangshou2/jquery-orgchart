function groupBy(collection, iteratee) {
    return collection.reduce(function(result,value,key){
        console.log('11',result,value,key);
    },{})
}
var renderData = [{
    id: 'a',
    pid: null,
    title: 'test',
    text: 'wcs'
}, {
    id: 'b',
    pid: 'a',
    title: 'child1',
    text: 'child1'
}, {
    id: 'c',
    pid: 'a',
    title: 'child1',
    text: 'text'
}, {
    id: 'd',
    pid: 'b',
    title: 'child11',
    text: 'text11'
}, {
    id: 'e',
    pid: 'b',
    title: 'child22',
    text: 'text22'
}]
groupBy(renderData, function (n) {
    console.log('n', n);
    return n[options.pid];
})