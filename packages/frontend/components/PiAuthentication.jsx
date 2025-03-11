//packages/frontend/components/PiAuthentication.jsx
import axios from 'axios';
import MeteoriteButton from './MeteoriteButton';

function PiAuthentication({ onAuthentication, isAuthenticated, onBalanceUpdate }) {
  const handleAuthentication = async () => {
    try {
      const Pi = window.Pi;
      if (!Pi || typeof Pi.authenticate !== 'function') {
        throw new Error("Pi SDK not properly initialized");
      }
      if (!Pi.initialized) {
        await Pi.init({ version: "2.0", sandbox: process.env.NODE_ENV === 'development' });
      }
      const scopes = ['username', 'payments', 'wallet_address'];
      const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
      onAuthentication(await signInUser(authResult), authResult.user);
    } catch (err) {
      console.error('Authentication failed', err);
      onAuthentication(false, null);
    }
  };

  const signInUser = async (authResult) => {
    try {
      const response = await axios.post(
        'http://localhost:5001/auth/signin',
        { authResult },
        { withCredentials: true }
      );
      console.log('Sign-in response:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('Sign-in error:', error);
      return false;
    }
  };

  const onIncompletePaymentFound = async (payment) => {
    try {
      const paymentId = payment.identifier;
      // Send request with cookie for authentication
      const response = await axios.post(
        'http://localhost:5001/auth/incomplete_server_payment/' + paymentId,
        { payment },
        { withCredentials: true }
      );
      if (response.status !== 200) {
        console.error('Incomplete payment error:', response.data.error);
        return;
      }
      console.log('Incomplete payment found:', response.data);
      const balanceResponse = await axios.get(
        'http://localhost:5001/api/user-balance',
        { withCredentials: true }
      );
      if (balanceResponse.status === 200) {
        onBalanceUpdate(balanceResponse.data.balance);
      } else {
        console.error('Failed to fetch user balance:', balanceResponse.data.error);
      }
    } catch (error) {
      console.error('Incomplete payment error:', error);
    }
  };

  return (
    <div className="pi-authentication">
      <div className="relative">
        <MeteoriteButton
          onClick={handleAuthentication}
          disabled={isAuthenticated}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}

export default PiAuthentication;