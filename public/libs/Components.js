if (Lib.JS.isUndefined(Lib.Comp)) {	
	Lib.Comp = {};

    var creation = function () {

        Lib.Comp.setupDefualtProperties = function (component, query) {
			if(component.getAttribute('class')!=null){
					component.shadowRoot.querySelector(query).className = component.getAttribute('class');
					component['class'] = component.getAttribute('class');
				}else{
					component['class'] = "";
				}
				
				if(component.getAttribute('id')!=null){
					component.shadowRoot.querySelector(query).id = component.getAttribute('id');
					component.id = component.getAttribute('id');
				}else{
					component.id = "";
				}
		};
    };
    creation.call(Lib.Comp);
}