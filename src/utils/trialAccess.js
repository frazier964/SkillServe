// Trial and Premium Access Management Utilities

export const checkTrialStatus = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
    
    const activeSubscription = subscriptions.find(
      sub => sub.email === user.email && sub.active
    );

    if (!activeSubscription) {
      return { hasAccess: false, reason: 'no_subscription' };
    }

    // If it's a regular paid subscription
    if (!activeSubscription.isTrial) {
      return { hasAccess: true, subscription: activeSubscription };
    }

    // If it's a trial subscription, check if it's expired
    const trialEnd = new Date(activeSubscription.trialEnd);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
      return { 
        hasAccess: true, 
        subscription: activeSubscription,
        isTrialActive: true,
        daysLeft
      };
    } else {
      // Trial expired - revoke access immediately
      expireTrialAccess(user.email, activeSubscription.plan);
      return { 
        hasAccess: false, 
        reason: 'trial_expired',
        expiredPlan: activeSubscription.plan
      };
    }
  } catch (e) {
    console.error('Error checking trial status:', e);
    return { hasAccess: false, reason: 'error' };
  }
};

export const expireTrialAccess = (userEmail, planId) => {
  try {
    // Update subscription to inactive
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
    const updatedSubs = subscriptions.map(sub => 
      sub.email === userEmail && sub.plan === planId 
        ? { ...sub, active: false, expiredAt: new Date().toISOString() } 
        : sub
    );
    localStorage.setItem('subscriptions', JSON.stringify(updatedSubs));
    
    // Update user status
    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.premium = false;
    user.isTrial = false;
    delete user.premiumPlan;
    delete user.trialEnd;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Dispatch event to update UI
    window.dispatchEvent(new CustomEvent('subscriptionsUpdated', { 
      detail: { email: userEmail, active: false, trialExpired: true } 
    }));

    return true;
  } catch (e) {
    console.error('Error expiring trial access:', e);
    return false;
  }
};

export const requiresPremiumAccess = (feature = 'premium features') => {
  const status = checkTrialStatus();
  
  if (!status.hasAccess) {
    let message = '';
    switch (status.reason) {
      case 'no_subscription':
        message = `Premium subscription required to access ${feature}. Please upgrade your account.`;
        break;
      case 'trial_expired':
        message = `Your free trial for ${status.expiredPlan} has ended. Please subscribe to continue accessing ${feature}.`;
        break;
      default:
        message = `Premium access required for ${feature}. Please check your subscription.`;
    }
    
    return {
      allowed: false,
      message,
      shouldRedirect: true,
      redirectTo: '/premium'
    };
  }
  
  return {
    allowed: true,
    isTrialActive: status.isTrialActive,
    daysLeft: status.daysLeft,
    subscription: status.subscription
  };
};