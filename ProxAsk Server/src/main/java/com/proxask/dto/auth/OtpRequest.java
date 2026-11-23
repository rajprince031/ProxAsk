package com.proxask.dto.auth;

import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpRequest {
    private String email;
    private int otp;

    @JsonSetter
    public void setOtp(Object val) {
        if (val instanceof Number num) {
            this.otp = num.intValue();
        } else if (val != null) {
            try {
                this.otp = Integer.parseInt(val.toString().trim());
            } catch (NumberFormatException e) {
                this.otp = 0;
            }
        }
    }
}
