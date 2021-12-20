import React, { Component } from 'react';
import Layout from '../Components/Layout';
import factory from '../ethereum/factory';
import { Card, Button } from 'semantic-ui-react';
import { Link } from '../routes';

class App extends Component {
    static async getInitialProps() {
        const campaings = await factory.methods.getCampaigns().call();

        return { campaings };
    }

    renderCampaings = () => {
        let items = this.props.campaings.map(address => ({
            header: address,
            description: <Link route={`/campaigns/${address}`}><a>View Campaign</a></Link>,
            fluid: true
        }));

        return <Card.Group items={items}/>
    }

    render() {
        return(
            <Layout>
                <h3>Open Campaigns</h3>
                <Link route="/campaigns/new">
                    <Button floated="right" content="Create Campaign" icon="add circle" primary />
                </Link>

                {this.renderCampaings()}
            </Layout>
        )
    }
}

export default App;