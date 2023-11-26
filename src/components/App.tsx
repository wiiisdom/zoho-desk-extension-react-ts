import { useEffect, useState } from "react";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("not set!");

  useEffect(() => {
    // waiting the ZOHODESK extension loading using it
    ZOHODESK.extension.onload().then(() => {
      setLoading(false);
      ZOHODESK.get("ticket.email").then((data) => {
        setEmail(data["ticket.email"]);
      });

      /*	
					//To Set data in Desk UI Client
					ZOHODESK.set('ticket.comment', { 'content': "Test comment" }).then(function (res) {
						//response Handling
					}).catch(function (err) {
						//error Handling
					});
		
					//Access Data Storage for an extension
					//Get the saved data of an extension from data storage
					ZOHODESK.get('database', { 'key': 'key1', 'queriableValue': 'value1' }).then(function (response) {
						//response Handling
					}).catch(function (err) {
						//error Handling
					})            
					
					//Save data in to data staorage
					ZOHODESK.set('database', { 'key': 'key_1', 'value': { 'id': 123 }, 'queriableValue': 'value1' }).then(function (response) {
						//response Handling
					}).catch(function (err) {
						//error Handling
					})
		
					//Change tabs in ticket detailview
					ZOHODESK.invoke('ROUTE_TO', 'ticket.attachments');
		
					//To Insert the content in the current opened reply editor from extension
					ZOHODESK.invoke('Insert', 'ticket.replyEditor', { content: "<p>your content</p>" });
		
					//To listen to an event in desk
					App.instance.on('comment_Added', function(data){
						//data handling 
					});
		
					//To access locale
					App.locale;
		
					//To access localresources
					App.localeResource            
						
					//To Know more on these, please read the documentation
				*/
    });
  });

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        <h2>React Powered!</h2>
        <p role="content">Email: {email}</p>
      </>
    );
  }
};

export default App;
