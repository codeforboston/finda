//setup values for the popup
var createPopup = function(configs, features) {
    console.log("creating popup");
    var values = [];
    for(var key in configs){
        if(features[key] && features[key] != "" && features[key].length != 0){
            values.push({
                div_id: key,
                value: formatElement(features[key], configs[key])
            })
        }
    }
    console.log(values);

    //Takes a list of html items and puts them in a popup template
    var popupTemplate = Handlebars.compile("<div>{{#popup}}<div id={{div_id}}>{{{value}}}</div id={{div_id}}>{{/popup}}</div>");
    console.log(popupTemplate({popup:values}));

    return popupTemplate({popup:values});
};

var formatElement = function(element, configs) {
    console.log("format element", element);
    if (configs['url']) {
        console.log("url");
        var title = configs['title'] || "[link]";
        return urlTemplate(title, element, configs);
    }
    if (configs['title']) {
        console.log("title");
        return titleTemplate(configs['title'], element, configs);
    }
    if (Array.isArray(element)){
        console.log("array");
        return listTemplate(element, configs);
    }
    console.log("simple");
    return simpleTemplate(element, configs);
};

var simpleTemplate = function(t, configs){
    console.log("simple template", t);
    t = t.replace(/\n/g, '<br />');
    var template = Handlebars.compile("{{{text}}}");
    return template({"text":t});
};
var titleTemplate = function(title, text, configs){
    console.log("title template", title, text);
    var template = Handlebars.compile("<div> <h4>{{title}}</h4> <div>{{{text}}}</div> </div>");
    return template({"title":title, "text":formatElement(text, {})});
};
var listTemplate = function(elements, configs){
    if (elements.length == 1) {
        return formatElement(elements[0], configs);
    }
    console.log(elements);
    var vals = [];
    for (var i = 0; i < elements.length; i++){
        var elem = elements[i];
        console.log("list element", elem);
        vals.push({"element":simpleTemplate(elem)})
    }
    console.log("list template", elements);
    var template = Handlebars.compile("<ul> {{#list}} <li>{{{element}}}</li> {{/list}} <ul>");
    return template({"list":vals});
};
var urlTemplate = function(title, url, configs){
    console.log("url template", title, url);
    var template = Handlebars.compile("<a href={{url}}>{{title}}</a>");
    return template({"title":title, "url":url});
};