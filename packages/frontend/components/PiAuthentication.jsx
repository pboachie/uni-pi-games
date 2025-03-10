import axios from 'axios';
import MeteoriteButton from './MeteoriteButton';

function PiAuthentication({ onAuthentication, isAuthenticated, onBalanceUpdate }) {
  const handleAuthentication = async () => {
    try {
      const scopes = ['username', 'payments', 'wallet_address'];
      const Pi = window.Pi;
      if (!Pi || typeof Pi.authenticate !== 'function') {
        throw new Error("Pi SDK not available or 'authenticate' method not found");
      }
      const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
      onAuthentication(await signInUser(authResult), authResult.user);
    } catch (err) {
      console.error('Authentication failed', err);
      onAuthentication(false, null);
    }
  };

  const signInUser = async (authResult) => {
    try {
      if (localStorage.getItem('@pi-lotto:access_token')) {
        localStorage.removeItem('@pi-lotto:access_token');
      }
      // Using backend URL as in #codebase (see #file:authRouter.ts)
      const response = await axios.post('http://localhost:5001/signin', { authResult });
      if (response.status !== 200) return false;
      if (response.data.access_token) {
        localStorage.setItem('@pi-lotto:access_token', response.data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign-in error:', error);
      return false;
    }
  };

  const onIncompletePaymentFound = async (payment) => {
    try {
      const paymentId = payment.identifier;
      const response = await axios.post('http://localhost:5001/incomplete_server_payment/' + paymentId, { payment });
      if (response.status !== 200) {
        console.error('Incomplete payment error:', response.data.error);
        return;
      }
      console.log('Incomplete payment found:', response.data);
      const balanceResponse = await axios.get('http://localhost:5001/api/user-balance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('@pi-lotto:access_token')}`,
        },
      });
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
          <MeteoriteButton onClick={handleAuthentication} disabled={isAuthenticated} isAuthenticated={isAuthenticated} />
        </div>
    </div>
  );
}

export default PiAuthentication;
