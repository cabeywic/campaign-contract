import React, { Component } from 'react';
import Layout from '../../Components/Layout';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';

class CampaignInfo extends Component {

    render() {
        return(
            <Layout>
                <h3>Campaign Information</h3>
            </Layout>
        )
    }
}

export default CampaignInfo;