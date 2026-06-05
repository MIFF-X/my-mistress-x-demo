/**
 * Mistress-X Tip Jar UI (React/JSX)
 * UI: The interactive "Jar" with dynamic naming and icons.
 */

const { useState, useEffect } = React;
const { Card, Button, Typography, TextField } = MaterialUI;

const MistressTipJar = ({ mistressId }) => {
    const [jarConfig, setJarConfig] = useState({
        name: "Tickle My Fancy",
        icon: "☕",
        active: true
    });
    const [tipAmount, setTipAmount] = useState("");

    // Load custom naming/icon settings from Mistress Profile via Middleware
    useEffect(() => {
        // Fetch logic from middleware/tip-jar-logic.js
        if (window.TipJarLogic) {
            const config = window.TipJarLogic.getSettings(mistressId);
            setJarConfig(config);
        }
    }, [mistressId]);

    const handleTip = (amount) => {
        const finalAmount = amount || tipAmount;
        if (!finalAmount) return alert("Please enter a tribute amount.");
        
        console.log(`[Tip Jar] Sending $${finalAmount} to Mistress ${mistressId}`);
        
        // Trigger Wallet Deduction Logic & "Cha-Ching" sound
        if (window.socket) {
            window.socket.emit('tip:sent', { amount: finalAmount, to: mistressId });
        }
        setTipAmount("");
    };

    if (!jarConfig.active) return null;

    return (
        <Card className="p-4 bg-gray-800 border-2 border-pink-500 shadow-lg text-center max-w-xs mx-auto">
            <div className="text-4xl mb-2 ml-auto mr-auto transform hover:scale-125 transition-transform cursor-pointer">
                {jarConfig.icon}
            </div>
            <Typography variant="h6" className="text-pink-400 font-bold mb-3 italic">
                "{jarConfig.name}"
            </Typography>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {[5, 10, 20, 50].map(amt => (
                    <Button 
                        key={amt} 
                        variant="outlined" 
                        color="secondary" 
                        size="small"
                        onClick={() => handleTip(amt)}
                        className="text-xs border-pink-700 text-pink-300"
                    >
                        ${amt}
                    </Button>
                ))}
            </div>

            <div className="flex items-center space-x-2">
                <TextField 
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Custom $"
                    variant="outlined"
                    size="small"
                    className="bg-gray-700 text-white rounded"
                    inputProps={{ style: { color: 'white', textAlign: 'center' }}}
                />
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleTip()}
                    className="bg-pink-600 hover:bg-pink-700"
                >
                    Give
                </Button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Instant Tribute Credit</p>
        </Card>
    );
};

const App = () => <MistressTipJar mistressId="Mistress_Viper_01" />;
