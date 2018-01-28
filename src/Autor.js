import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from "./components/CustomInput";
import PubSub from 'pubsub-js';

class FormularioAutor extends Component {


	constructor() {
		super();
		
		this.state = { users : [], nome: '', email: '', senha: ''};
		this.set = this.set.bind(this);
		this.sendForm = this.sendForm.bind(this);
	}

	set(propName, e) {
		let obj = {};
		obj[propName] = e.target.value;

		this.setState(obj);
	}

	sendForm(e) {
		e.preventDefault();

		const data = JSON.stringify({ nome : this.state.nome, email : this.state.email, senha : this.state.senha });

		$.ajax({
		     url:'http://cdc-react.herokuapp.com/api/autores',
		     contentType:'application/json',
		     dataType:'json',
		     type:'post',
		     data: data,
		     success: function(resposta){
		       console.log("enviado com sucesso");
		       PubSub.publish('update-user-list', resposta);

		     },
		     error: function(resposta){
		       console.log("erro");
		     }
		   });

	}

	render() {
		return(
			<div className="pure-form pure-form-aligned">
			  <form className="pure-form pure-form-aligned" onSubmit={this.sendForm}>
				
			  	<CustomInput id="nome" type="text" label="nome" name="nome" value={this.state.nome} onChange={this.set.bind(this, "nome")}/>

			  	<CustomInput id="email" type="email" label="email" name="email" value={this.state.email} onChange={this.set.bind(this, "email")}/>

			  	<CustomInput id="nome" type="password" label="password" name="senha" value={this.state.senha} onChange={this.set.bind(this, "senha")}/>

				<div className="pure-control-group">                                  
				  <label></label> 
				  <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
				</div>

			  </form>             
			</div>
		);
	}
}

class TabelaAutores extends Component {

	constructor() {
		super();
	}

	render() {
		return (
			<div>            
			  <table className="pure-table">
				<thead>
				  <tr>
					<th>Nome</th>
					<th>email</th>
				  </tr>
				</thead>
				<tbody>
				  {
				  	this.props.users.map( e => { 
				  		return (
				  			<tr key={e.id}>
				  				<td>{e.nome}</td>
				  				<td>{e.email}</td>
				  			</tr>
				  		)
				  	})
				  }
				</tbody>
			  </table> 
			</div>
		);
	}
}


/**
 * This is called High order compontents.

 	This is very userful when we need to share state between two components.
 	This component acts as a 'father' compontent and uses callbacks to upadte the states between components.
 */
export default class AutorBox extends Component {

	constructor() {
		super();
		
		this.state = { users : [] };

		this.updateList = this.updateList.bind(this);

		// Observer library
		PubSub.subscribe('update-user-list', this.updateList );
	}

	componentDidMount() {

		let _self = this;
		$.getJSON("http://cdc-react.herokuapp.com/api/autores", {}, function(ret) {

			console.log(ret);
			_self.setState({ users : ret.slice(ret.length - 11, ret.length)});	

		});
	}

	updateList(_topic, data) {
		this.setState({ users : data.slice(data.length - 11, data.length)});
	}	

	render() {

		return(
			<div>
				<div className="header">
		          <h1>Cadastro de Autores</h1>
		        </div>
		        <div className="content" id="content">                            
		          <FormularioAutor/>
		          <TabelaAutores users={this.state.users}/>        
	        	</div> 
        	</div> 
		);
	}



}




