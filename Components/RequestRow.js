import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Campaign from '../ethereum/campaign';
import { Router } from '../routes';
import swal from 'sweetalert2';

class RequestRow extends Component {
    onApprove = async () => {
        const { id, address } = this.props;
        const campaign = Campaign(address);

        try {
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.approveRequest(id).send({ from: accounts[0] });

            Router.replaceRoute(`/campaigns/${address}/requests`);
        } catch(err) {
            swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }

    onFinalize = async () => {
        const { id, address } = this.props;
        const campaign = Campaign(address);
        
        try {
            const accounts = await web3.eth.getAccounts();
            await campaign.methods.finalizeRequest(id).send({ from: accounts[0] });

            Router.replaceRoute(`/campaigns/${address}/requests`);
        } catch(err) {
            swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'OK'
            })
        }
    }

    render(){
        const { Row, Cell } = Table;
        const { request, id, approversCount } = this.props;
        const readyToFinalize = request.approvalCount > approversCount / 2;

        return (
            <Row 
              disabled={request.complete}
              positive={readyToFinalize && !request.complete}
            >
                <Cell>{id}</Cell>
                <Cell>{request.description}</Cell>
                <Cell>{request.amount}</Cell>
                <Cell>{request.recipient}</Cell>
                <Cell>{request.approvalCount}/{approversCount}</Cell>
                <Cell>
                    <Button color="green" basic onClick={this.onApprove} disabled={request.complete}>
                        Approve
                    </Button>
                </Cell>
                <Cell>
                    <Button color="red" basic onClick={this.onFinalize} disabled={request.complete}>
                        Finalize
                    </Button>
                </Cell>
            </Row>
        )
    }
}

export default RequestRow;