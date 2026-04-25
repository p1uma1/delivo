async function run() {
  try {
    const email = `test${Date.now()}@test.com`;
    console.log('1. Registering user...');
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123', name: 'Test User' })
    });
    
    const registerBody = await registerRes.text();
    console.log(`Register status: ${registerRes.status}`);
    console.log('Register response:', registerBody);
    
    if (registerRes.status !== 201) {
      console.error('Registration failed.');
      return;
    }

    const registerData = JSON.parse(registerBody);
    const token = registerData.data.accessToken;
    
    console.log('\n2. Making a payment...');
    const orderId = `order_${Date.now()}`;
    const paymentRes = await fetch('http://localhost:3000/api/payments/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, amount: 150.50, paymentMethod: 'card' })
    });
    
    const paymentBody = await paymentRes.text();
    console.log(`Payment status: ${paymentRes.status}`);
    console.log('Payment response:', paymentBody);

    if (paymentRes.status !== 201) {
      console.error('Payment creation failed.');
      return;
    }

    const paymentData = JSON.parse(paymentBody);
    const paymentId = paymentData.data.id;
    
    console.log('\n3. Verifying the payment...');
    const verifyRes = await fetch(`http://localhost:3000/api/payments/${paymentId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const verifyBody = await verifyRes.text();
    console.log(`Verify status: ${verifyRes.status}`);
    console.log('Verify response:', verifyBody);
    
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
