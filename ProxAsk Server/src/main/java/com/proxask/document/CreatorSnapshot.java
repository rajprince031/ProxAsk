package com.proxask.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorSnapshot {
    private String userId;
    private String username;
    private String firstName;
    private String avatar;
}
