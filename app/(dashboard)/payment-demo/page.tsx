"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PayWithSolana } from "@/components/payment";
import {
  PageHeader,
  NotConnectedState,
} from "@/components/dashboard";
import { useWallet } from "@lazorkit/wallet";
import toast from "react-hot-toast";

export default function PaymentDemoPage() {
  const { isConnected } = useWallet();
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <NotConnectedState
        title="Payment Widget Demo"
        message="Please connect your wallet to see the payment widget."
        showSetup
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] p-6 lg:p-10 text-black">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Pay with Solana Widget"
          description="Reusable payment widget that can be embedded anywhere"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Example 1: Basic Payment */}
          <Card className="bg-white">
            <CardHeader>
              <h2 className="text-xl font-semibold">Example 1: Basic Payment</h2>
              <p className="text-sm text-[#8e8e93]">
                Simple payment widget with default settings
              </p>
            </CardHeader>
            <CardContent>
              <PayWithSolana
                amount={0.1}
                description="Premium Subscription"
                onSuccess={(sig) => {
                  setPaymentSuccess(sig);
                  toast.success("Payment successful!");
                }}
                onError={(error) => {
                  toast.error("Payment failed");
                }}
              />
            </CardContent>
          </Card>

          {/* Example 2: Custom Amount */}
          <Card className="bg-white">
            <CardHeader>
              <h2 className="text-xl font-semibold">Example 2: Custom Amount</h2>
              <p className="text-sm text-[#8e8e93]">
                Payment widget with custom merchant address
              </p>
            </CardHeader>
            <CardContent>
              <PayWithSolana
                amount={0.5}
                description="Product Purchase"
                merchantAddress="55czFRi1njMSE7eJyDLx1R5yS1Bi5GiL2Ek4F1cZPLFx"
                onSuccess={(sig) => {
                  toast.success("Payment successful!");
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Usage Example */}
        <Card className="bg-white mt-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">How to Use</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Installation</h3>
                <pre className="bg-[#f2f2f7] p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`import { PayWithSolana } from "@/components/payment";

<PayWithSolana
  amount={0.1}
  description="Your Product"
  merchantAddress="your-wallet-address"
  onSuccess={(sig) => console.log("Paid:", sig)}
/>`}</code>
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="list-disc list-inside text-sm text-[#8e8e93] space-y-1">
                  <li>Gasless payments via LazorKit Paymaster</li>
                  <li>Automatic wallet connection</li>
                  <li>Balance validation</li>
                  <li>Success/error callbacks</li>
                  <li>Fully customizable</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {paymentSuccess && (
          <Card className="bg-white mt-6 border-green-300 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-800">
                <strong>Payment Successful!</strong> Transaction: {paymentSuccess.slice(0, 16)}...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

