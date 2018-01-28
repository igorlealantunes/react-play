import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from "./components/CustomInput";
import PubSub from 'pubsub-js';


class LivroRegistry extends Component {

	constructor() {
		super();

		this.state = { titulo : "", preco: "", autorId: ""};
		this.set = this.set.bind(this);
		this.sendForm = this.sendForm.bind(this);
	}

	set(propName, e) {
		console.log("setting...", propName);
		let obj = {};
		obj[propName] = e.target.value;

		this.setState(obj);
	}

	sendForm(e) {
		e.preventDefault();

		const data = JSON.stringify({ titulo : this.state.titulo, preco : this.state.preco, 'autorId': this.state.autorId });

		$.ajax({
		     url:'http://cdc-react.herokuapp.com/api/livros',
		     contentType:'application/json',
		     dataType:'json',
		     type:'post',
		     data: data,
		     success: function(resposta){
		       console.log("enviado com sucesso");
		       PubSub.publish('update-livro-list', resposta);

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
				
			  	<CustomInput id="titulo" type="text" label="titulo" name="titulo" value={this.state.titulo} onChange={this.set.bind(this, "titulo")}/>

			  	<CustomInput id="preco" type="text" label="preco" name="preco" value={this.state.preco} onChange={this.set.bind(this, "preco")}/>

			  	<select value={this.state.autorId} onChange={this.set.bind(this,"autorId")}>
			  		<option value="">Select an Author</option>

			  		{
			  			this.props.autores.map(a => <option key={a.id} value={a.id}>{a.nome}</option> )
			  		}

			  	</select>
				<div className="pure-control-group">                                  
				  <label></label> 
				  <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
				</div>

			  </form>             
			</div>
		);	
	}


}

class LivroTable extends Component {

	constructor() {
		super();
	}

	render() {
		return(
			<div>
				<table className="pure-table">

					<thead>
						<tr>
							<th>Nome</th>
							<th>Preco</th>
							<th>Autor</th>
						</tr>
					</thead>
					<tbody>
						 {
						  	this.props.livros.map( e => { 
						  		return (
						  			<tr key={e.id}>
						  				<td>{e.titulo}</td>
						  				<td>{e.preco}</td>
						  				<td>{e.autor.nome} ({e.autor.email})</td>
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


export default class LivroBox extends Component {
	
	constructor() {
		super();
		this.state = { livros : [], autores : [] };

		this.updateList = this.updateList.bind(this);
		// Observer library
		PubSub.subscribe('update-livro-list', this.updateList );
	}

	componentDidMount() {

		let _self = this;
		$.getJSON("http://cdc-react.herokuapp.com/api/livros", {}, function(ret) {

			console.log(ret);
			_self.setState({ livros : ret.slice(ret.length - 11, ret.length)});	

		});

		$.getJSON("http://cdc-react.herokuapp.com/api/autores", {}, function(ret) {

			console.log(ret);
			_self.setState({ autores : ret.slice(ret.length - 11, ret.length)});	

		});
	}

	updateList(_topic, data) {
		this.setState({ livros : data.slice(data.length - 11, data.length)});
	}	

	render() {
		return(
			<div>
				<div className="header">
		          <h1>Cadastro de Livros</h1>
		        </div>
		        <div className="content" id="content">                            
		          <LivroRegistry autores={this.state.autores}/>
		          <LivroTable livros={this.state.livros}/>        
	        	</div> 
        	</div>
        );
	}
}