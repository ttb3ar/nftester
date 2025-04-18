document.addEventListener('DOMContentLoaded', function() {
    const targetIp = document.getElementById('target-ip');
    const targetPort = document.getElementById('target-port');
    const packetCount = document.getElementById('packet-count');
    const generateButton = document.getElementById('generate-button');
    const results = document.getElementById('results');
    const ipError = document.getElementById('ip-error');
    const copyButton = document.getElementById('copy-button');
    const downloadButton = document.getElementById('download-script');
    
    targetIp.addEventListener('blur', validateIp);
    
    generateButton.addEventListener('click', function() {
        if (!validateIp()) {
            return;
        }
        
        const ip = targetIp.value;
        const port = targetPort.value;
        const count = packetCount.value;
        
        // Generate customized script
        const script = generateScript(ip, port, count);
        
        // Display the script
        results.innerHTML = `<pre>${script}</pre>`;
        copyButton.style.display = 'block';
    });
    
    copyButton.addEventListener('click', function() {
        const scriptText = results.querySelector('pre').textContent;
        navigator.clipboard.writeText(scriptText)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            const scriptText = document.getElementById('base-code').textContent;
            downloadTextAsFile(scriptText, 'netflow_test.py');
        });
    }
    
    function validateIp() {
        const ip = targetIp.value.trim();
        if (!ip) {
            ipError.textContent = 'IP address is required';
            return false;
        }
        
        // Simple IP validation regex
        const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        const match = ip.match(ipRegex);
        
        if (!match) {
            ipError.textContent = 'Invalid IP address format';
            return false;
        }
        
        // Check each octet is 0-255
        for (let i = 1; i <= 4; i++) {
            const octet = parseInt(match[i]);
            if (octet < 0 || octet > 255) {
                ipError.textContent = 'Each octet must be between 0 and 255';
                return false;
            }
        }
        
        ipError.textContent = '';
        return true;
    }
    
    function generateScript(ip, port, count) {
        return `import socket
import time
import random
import struct

def send_dummy_netflow():
    """
    Send dummy netflow v5 packets to a target IP and port
    """
    target_ip = "${ip}"
    target_port = ${port}
    count = ${count}
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    for i in range(count):
        # Create a simple netflow v5 header (simplified)
        version = 5
        count_records = 1  # One flow record
        sys_uptime = int(time.time() * 1000) % (2**32)
        unix_secs = int(time.time())
        unix_nsecs = int((time.time() - unix_secs) * 1000000000)
        flow_sequence = i
        engine_type = 0
        engine_id = 0
        sampling_interval = 0
        
        # Create header
        header = struct.pack('!HHIIIIBBH', 
                            version, count_records, sys_uptime, 
                            unix_secs, unix_nsecs, flow_sequence,
                            engine_type, engine_id, sampling_interval)
        
        # Create a simple flow record (simplified)
        src_ip = socket.inet_aton('192.168.1.1')
        dst_ip = socket.inet_aton('10.0.0.1')
        next_hop = socket.inet_aton('0.0.0.0')
        input_if = random.randint(1, 10)
        output_if = random.randint(1, 10)
        packets = random.randint(1, 1000)
        octets = packets * random.randint(64, 1500)
        first = sys_uptime - random.randint(1000, 10000)
        last = first + random.randint(1, 1000)
        src_port = random.randint(1024, 65535)
        dst_port = random.randint(1, 1023)
        tcp_flags = 0
        protocol = 6  # TCP
        tos = 0
        src_as = 0
        dst_as = 0
        src_mask = 24
        dst_mask = 24
        flags = 0
        
        # Create flow record
        flow = struct.pack('!4s4s4sHHIIIIHHBBBBBBHHI',
                          src_ip, dst_ip, next_hop,
                          input_if, output_if, packets, octets,
                          first, last, src_port, dst_port, 
                          tcp_flags, protocol, tos, src_as, dst_as,
                          src_mask, dst_mask, flags)
        
        # Combine header and flow
        packet = header + flow
        
        # Send the packet
        sock.sendto(packet, (target_ip, target_port))
        print(f"Sent packet {i+1}/{count}")
        time.sleep(0.5)
    
    sock.close()
    print(f"Finished sending {count} test packets to {target_ip}:{target_port}")

if __name__ == "__main__":
    send_dummy_netflow()
`;
    }
    
    function downloadTextAsFile(text, filename) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
    }
});

function switchTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // Update tab styling
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Find and activate the clicked tab
    const clickedTab = Array.from(tabs).find(tab => tab.onclick.toString().includes(tabId));
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
}
