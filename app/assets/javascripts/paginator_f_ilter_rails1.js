window.PaginatorFIlterRails1 = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function() {
    new Pf1.Routers.Zones;
    Backbone.history.start();
  }
};
var Pf1 = PaginatorFIlterRails1;
Pf1.Routers.Zones = Backbone.Router.extend({
	routes :
	{
		'' : 'index'
	},
	index : function ()
	{
		var zones_collection = new Pf1.Collections.Zones();
		zones_collection.fetch();
		new Pf1.Views.Zones({
			el         : $('#zones_table'), 
			collection : zones_collection
		});
	}
	
});

Pf1.Models.Zone = Backbone.Model.extend({
	saveStrip : function(options)
	{
		var funky = this.attributes.funky
		this.unset('funky',{silent:true});
		this.save({success: options.success});
		this.set({funky: funky})
	}
});

Pf1.Collections.Zones = Backbone.Collection.extend({
	url : '/zones',
	model : Pf1.Models.Zone,
	initialize : function()
	{
		console.log('Pf1.Collections.Zones initialized')
	}
});

Pf1.Views.Zones = Backbone.View.extend({
	
	initialize: function(){ 
		_.bindAll(this,'render','appendItem');
		this.header = $(Mustache.to_html("<thead><th>Name</th><th>Site</th><th>Auto-approve</th></thead>", {})).appendTo(this.el);
		this.tbody = $('<tbody></tbody>').appendTo($(this.el));
		this.collection.bind('add',this.appendItem);
		this.collection.bind('reset',this.render);
		this.collection.bind('sort',this.sort)
		this.render();
	},
	render: function(){
		this.tbody.html('');
		_(this.collection.models).each(function(row){
			this.appendItem(row);
		}, this)
	},
	update: function()
	{
		this.tbody.html(''); 
		_(this.models).each(function(row){
			row.change();
		})
	},
	appendItem : function(row)
	{
		var view = this;
		var rowView = new Pf1.Views.Zone({
			model : row
		});
		if(rowView) this.tbody.append(rowView.render().el);
	}
})


Pf1.Views.Zone = Backbone.View.extend({
	
	tagName : 'tr',
	initialize : function()
	{
		_.bindAll(this,'render','unrender','remove');
		this.model.bind('remove',this.unrender);
		this.model.bind('change', this.render)
	},
	template : "<td>{{attr.name}}</td><td>{{attr.site_name}}</td><td><input type='checkbox' class='checkbox' /></td>",
	events : 
	{
		'click input' : 'toggle_selection'
	},
	toggle_selection : function(e)
	{
		e.preventDefault();
		console.log(e.currentTarget.checked);
		console.log('toggle_selection');
		console.log(e.currentTarget.checked);
		this.model.set({auto_approve: e.currentTarget.checked, funky : 'monkey', dinky:"winky"});
		console.log(this.model)
		this.model.saveStrip({success : this.update_successful()})
	},
	update_successful : function()
	{
		console.log('succeed in updating')
		console.log(this.model)
	},
	render: function()
	{
		var el = $(this.el);
		el.html('');
		var tr = $(Mustache.to_html(this.template, {attr : this.model.toJSON(), check_status : (this.model.attributes.auto_approve) ? "checked=checked" : ''})).appendTo(this.el);
		tr.find('input.checkbox').prop("checked",this.model.attributes.auto_approve);
		return this
	},
	unrender: function()
	{
		var el = $(this.el);
		el.fadeOut('fast', function(){
			el.remove()
		});
	},
	remove: function()
	{
		this.model.destroy();
	}
});

$(document).ready(function(){
  Pf1.init();
});