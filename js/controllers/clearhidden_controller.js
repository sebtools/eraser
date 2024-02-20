
application.register('clear-hidden', class extends Stimulus.Controller {


	initialize() {

	}

	connect() {

		this.config();

	}

	config() {

		let observer = new MutationObserver(
			(mutations) => this.mutationListener(mutations)
		);

		//IF the controller is directly on the form, then automaticall set the action
		if ( this.element.tagName.toLowerCase() == "form" ) {
			if ( this.element.hasAttribute("data-action") ) {
				//Prepend clear action to form if it isn't already there
				var action = this.element.getAttribute("data-action");
				if ( !action.includes("clear-hidden#clearHidden") ) {
					this.element.setAttribute(
						"data-action",
						"clear-hidden#clearHidden " + action
					);
				}
			} else {
				//Simply set it if no data-action already exists
				this.element.setAttribute("data-action","clear-hidden#clearHidden");
			}
		} else {
			console.log("clear-hidden is designed to be attached to a form element.");
		}

		//Ability to clear elements as they are hidden
		if ( this.element.hasAttribute("data-clear-hidden-on") && this.element.getAttribute("data-clear-hidden-on") == "hide" ) {
			observer.observe(
				this.element,
				{
					attributeFilter: ['hidden','style']
					,subtree: true
				}
			);
		}

	}

	//I listen for all style/hidden changes and hide all fields that are under something that has turned invisible.
	mutationListener(mutations) {
		for ( let mutation of mutations ) {
			if ( mutation.type === 'attributes' ) {
				//If this element is no invisible, hide it and all its child fields
				if ( !this.isElementVisible(mutation.target) ) {
					this.clearElement(mutation.target)
					this.clearScope(mutation.target);
				}
			}
		}
	}

	//I clear all elements in the given scope (element)
	clearScope(scope) {
		var aFields = this.getScopeFields(scope);

		for ( var elem of aFields ) {
			this.clearElement(elem);
		}
	}

	//I clear the given element
	clearElement(element) {
		switch( element.tagName.toLowerCase() ) {
			case "input":
				switch ( element.type ) {
					case "checkbox":
					case "radio":
						//If a default is selected then check that.
						if ( element.parent.hasAttribute("data-default-value") && element.parent.getAttribute("data-default-value") == element.value ) {
							element.checked = true;
						} else {
							element.checked = false;
						}
					break;
					default:
						element.value = '';
				}
			break;
			case "select":
			case "textarea":
				element.value = '';
		}
	}

	//I clear all of the hidden elements in this controller.
	clearHidden() {
		var aElems = this.getHiddenFields(this.element);

		for ( var elem of aElems ) {
			clearElement(elem);
		}
		
	}

	//I clear all of the form fields in the given scope (element)
	getHiddenFields(scope) {
		var aResults = [];
	
		// Select all form fields
		var aFields = getScopeFields(scope);
	
		// Check each form field and its ancestors for visibility
		aFields.forEach(function(field) {
			var element = field;
			var isVisible = isElementVisible(field);
	
			// If the field or any of its ancestors are hidden, add it to the list
			if ( !isVisible ) {
				aResults.push(field);
			}
		});
	
		return aResults;
	}

	//I get all of the form fields in the given scope (element)
	getScopeFields(scope) {
		return scope.querySelectorAll('input, select, textarea');
	}

	//I check to see if the given element is effectively visible (checking the hidden and style and then climbing the parent tree ddo the same)
	isElementVisible(element) {
	
		// Check if the field itself is hidden
		if ( element.hidden || element.style.display === 'none' || element.style.visibility === 'hidden' ) {
			return false;
		}

		// Check if any of the field's ancestors are hidden
		while ( element.parentElement ) {
			element = element.parentElement;

			if ( element.hidden || element.style.display === 'none' || element.style.visibility === 'hidden' ) {
				return false;
			}
		}

		return true;
	}

})
