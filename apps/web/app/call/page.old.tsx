                 // Open the checkout link in a new tab so the user can pay
                window.open(data.url, '_blank');
              }
              output = data;
            } else if (name === 'confirmBooking') {
              const res = await fetch('/api/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId: args.appointmentId, paymentId: args.paymentId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'confirmBooking failed');
              output = data;
            }
          } catch (err: any) {
            console.error('Function call failed:', err);
            output = { error: err.message || 'error' };
          }
          // Send the function call output back to the model
          await client.send({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: item.call_id,
              output,
            },
          });
          // Trigger the assistant to continue
          await client.send({ type: 'response.create' });
        }
      });
      // Start the realtime session and attach audio tracks
      await client.start({
        configurePeerConnection: async (pc: RTCPeerConnection) => {
          // Attach remote audio to an audio element
          if (!audioRef.current) {
            const audioEl = new Audio();
            audioEl.autoplay = true;
            audioRef.current = audioEl;
          }
          pc.ontrack = (e) => {
            if (audioRef.current) {
              audioRef.current.srcObject = e.streams[0];
            }
          };
          // Add microphone track
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        },
      });
      setStatus('inCall');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start call');
      setStatus('error');
    }
  }

  // End the current call, cleaning up the peer connection
  function endCall() {
    if (clientRef.current) {
      clientRef.current.stop?.();
      clientRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setStatus('idle');
  }

  return (
    <div>
      <h1>AI Receptionist Call</h1>
      {status === 'idle' && <button onClick={startCall}>Start Call</button>}
      {status === 'connecting' && <p>Connecting… please allow microphone access.</p>}
      {status === 'inCall' && (
        <>
          <p>Talking to the AI receptionist…</p>
          <button onClick={endCall}>End Call</button>
          <div
            style={{
              marginTop: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #eaeaea',
            }}
          >
            <h3>Transcript</h3>
            {messages.map((m, idx) => (
              <p key={idx}>{m}</p>
            ))}
          </div>
        </>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
