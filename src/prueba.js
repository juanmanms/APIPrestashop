

//Get list of contacts
function get_contacts(conn) {
    return conn.query("SELECT id_customer, firstname, email FROM ps_customer limit 10");
}



const getOder = async () => {
    result = await connect("SELECT * FROM ps_orders limit 10");
    console.log(result);
}



getOder();