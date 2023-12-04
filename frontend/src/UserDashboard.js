import React from 'react';

function UserDashboard() {
    async function handleClaimRole() {
        window.location.href =
            "https://discord.com/api/oauth2/authorize?client_id=1178556490999664681&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds";
         setTimeout(() => {
            window.location.href = "https://discord.com/channels/1176838615268069398/1176838779210829834"
        }, 2000);
    }
    return (
        <div>
            <button style={{ background: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={() => handleClaimRole()}>Claim Role</button>
        </div>
    );
}

export default UserDashboard;
